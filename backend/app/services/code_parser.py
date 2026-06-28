import os
import re
from typing import Dict, List

# Tree-sitter might fail to initialize if bindings aren't pre-built or loaded.
# We will build a robust wrapper that gracefully falls back to Regex-based syntax parsing
# so it is guaranteed to work during developer testing.
class CodeParser:
    LANGUAGE_MAP = {
        ".py": "python",
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".java": "java",
    }

    def detect_language(self, filename: str) -> str:
        _, ext = os.path.splitext(filename.lower())
        return self.LANGUAGE_MAP.get(ext, "unknown")

    async def parse_code(self, code: str, language: str) -> Dict:
        """
        Extract code structure using Tree-sitter or regex fallback.
        """
        result = {
            "language": language,
            "line_count": len(code.splitlines()),
            "functions": [],
            "classes": [],
            "imports": [],
            "complexity_estimate": 0.0
        }

        # Attempt to run Tree-sitter parser, fall back to regex on failure
        parsed_via_tree_sitter = False
        try:
            # Dynamic imports of tree_sitter to avoid crashes
            from tree_sitter import Language, Parser
            import tree_sitter_python
            import tree_sitter_javascript
            import tree_sitter_typescript
            import tree_sitter_java

            # Select correct language grammar
            lang_grammar = None
            if language == "python":
                lang_grammar = Language(tree_sitter_python.language())
            elif language == "javascript":
                lang_grammar = Language(tree_sitter_javascript.language())
            elif language == "typescript":
                lang_grammar = Language(tree_sitter_typescript.language())
            elif language == "java":
                lang_grammar = Language(tree_sitter_java.language())

            if lang_grammar:
                parser = Parser(lang_grammar)
                tree = parser.parse(bytes(code, "utf8"))
                root_node = tree.root_node

                # Traverse tree to extract function declarations, class declarations, and imports
                # For simplicity in this script, we can run queries or simple recursive traversal
                self._traverse_node(root_node, code, result)
                parsed_via_tree_sitter = True
        except Exception as e:
            # Fall back silently to regex analysis
            pass

        if not parsed_via_tree_sitter:
            self._parse_via_regex(code, language, result)

        # Calculate estimated complexity
        result["complexity_estimate"] = self._calculate_complexity(code, language, result)
        
        return result

    def _traverse_node(self, node, code: str, result: Dict) -> None:
        """Helper to recursively traverse Tree-sitter AST nodes"""
        # Node types vary per language, mapping them here:
        node_type = node.type
        
        # Function declarations
        if node_type in ["function_definition", "function_declaration", "method_declaration"]:
            name_node = node.child_by_field_name("name")
            if name_node:
                func_name = code[name_node.start_byte:name_node.end_byte]
                result["functions"].append(func_name)
                
        # Class declarations
        elif node_type in ["class_definition", "class_declaration"]:
            name_node = node.child_by_field_name("name")
            if name_node:
                class_name = code[name_node.start_byte:name_node.end_byte]
                result["classes"].append(class_name)
                
        # Import declarations
        elif node_type in ["import_statement", "import_from_statement", "lexical_declaration", "variable_declarator"]:
            # Check for require or import keyword in content
            content = code[node.start_byte:node.end_byte]
            if "import" in content or "require" in content:
                result["imports"].append(content.strip())

        for child in node.children:
            self._traverse_node(child, code, result)

    def _parse_via_regex(self, code: str, language: str, result: Dict) -> None:
        """Regex-based fallback parsing for classes, functions, and imports"""
        lines = code.splitlines()

        if language == "python":
            # Def declarations
            result["functions"] = [m.group(1) for m in re.finditer(r"def\s+(\w+)\s*\(", code)]
            result["classes"] = [m.group(1) for m in re.finditer(r"class\s+(\w+)", code)]
            result["imports"] = [line.strip() for line in lines if line.strip().startswith(("import ", "from "))]
            
        elif language in ["javascript", "typescript"]:
            # Functions
            result["functions"] = [
                m.group(1) or m.group(2) 
                for m in re.finditer(r"(?:function\s+(\w+)|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>)", code)
                if m.group(1) or m.group(2)
            ]
            result["classes"] = [m.group(1) for m in re.finditer(r"class\s+(\w+)", code)]
            result["imports"] = [
                line.strip() 
                for line in lines 
                if "import " in line or "require(" in line
            ]
            
        elif language == "java":
            # Method definitions
            result["functions"] = [
                m.group(2)
                for m in re.finditer(r"(public|protected|private|static|\s) +[\w\<\>\[\]]+ +(\w+) *\([^\)]*\) *(?:\{|throws)", code)
            ]
            result["classes"] = [m.group(1) for m in re.finditer(r"class\s+(\w+)", code)]
            result["imports"] = [line.strip() for line in lines if line.strip().startswith("import ")]

    def _calculate_complexity(self, code: str, language: str, stats: Dict) -> float:
        """
        Estimate cognitive/cyclomatic complexity.
        """
        # Count branching structures
        branches = len(re.findall(r"(if|else|elif|switch|case|catch|throw|&&|\|\|)", code))
        loops = len(re.findall(r"(for|while|foreach|map|forEach|reduce|filter)", code))
        functions_count = len(stats["functions"])
        
        complexity = (branches * 2.0) + (loops * 3.0) + (functions_count * 1.5)
        
        # Scale to a 0-100 range
        return min(100.0, max(5.0, complexity))
code_parser = CodeParser()
