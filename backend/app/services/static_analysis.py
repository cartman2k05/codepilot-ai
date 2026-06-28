import json
import logging
import os
import subprocess
import tempfile
from typing import Dict, List

logger = logging.getLogger("codepilot.static_analysis")

class StaticAnalyzer:
    async def run_semgrep(self, code: str, language: str, filename: str) -> List[Dict]:
        """
        Runs Semgrep on a temp file with the target code and parses the results.
        If Semgrep is not installed, it falls back to basic Regex security scan rule engine.
        """
        # Determine extension suffix
        ext = ".txt"
        if language == "python":
            ext = ".py"
        elif language == "javascript":
            ext = ".js"
        elif language == "typescript":
            ext = ".ts"
        elif language == "java":
            ext = ".java"
            
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False) as f:
            f.write(code)
            temp_path = f.name

        findings = []
        try:
            # Check if semgrep is available
            cmd = ["semgrep", "--config", "auto", "--json", temp_path]
            # Run with a 30s timeout
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode in [0, 1]: # Semgrep outputs 1 if findings found
                data = json.loads(result.stdout)
                for match in data.get("results", []):
                    findings.append({
                        "rule_id": match.get("check_id", "semgrep-rule"),
                        "severity": self.normalize_severity(match.get("extra", {}).get("severity", "WARNING")),
                        "message": match.get("extra", {}).get("message", "Semgrep security finding"),
                        "line_start": match.get("start", {}).get("line"),
                        "line_end": match.get("end", {}).get("line"),
                        "category": "security" if "security" in match.get("check_id", "").lower() else "bugs"
                    })
            else:
                # If semgrep config auto failed, execute fallback scan
                findings = self._regex_security_fallback(code, language, filename)
        except (subprocess.SubprocessError, FileNotFoundError, json.JSONDecodeError):
            # Fallback scan when Semgrep command is missing or errors out
            findings = self._regex_security_fallback(code, language, filename)
        finally:
            try:
                os.remove(temp_path)
            except OSError:
                pass
                
        return findings

    def normalize_severity(self, semgrep_severity: str) -> str:
        s = semgrep_severity.upper()
        if s == "ERROR":
            return "critical"
        elif s == "WARNING":
            return "high"
        elif s == "INFO":
            return "medium"
        return "low"

    def _regex_security_fallback(self, code: str, language: str, filename: str) -> List[Dict]:
        """
        Regex security fallback patterns matching common issues to act as static analysis
        when Semgrep CLI is not installed on the system (e.g. hackathon demo run).
        """
        findings = []
        lines = code.splitlines()
        
        # 1. SQL Injection vulnerability check
        sql_pattern = re.compile(
            r"(select|insert|update|delete|from|where).*\+\s*(\w+)|.*\%\s*\w+|.*\.format\(", 
            re.IGNORECASE
        )
        
        # 2. Hardcoded secrets / api keys
        secret_pattern = re.compile(
            r"(api_key|secret|password|token|jwt_secret|private_key)\s*=\s*['\"][a-zA-Z0-9_\-\+]{12,}['\"]", 
            re.IGNORECASE
        )
        
        # 3. Dynamic code execution (eval, exec)
        eval_pattern = re.compile(r"\b(eval|exec)\s*\(", re.IGNORECASE)
        
        # 4. Command injection (subprocess.run shell=True)
        shell_pattern = re.compile(r"shell\s*=\s*True", re.IGNORECASE)

        for idx, line in enumerate(lines):
            line_num = idx + 1
            
            # SQL Injection
            if sql_pattern.search(line) and ("sql" in line.lower() or "query" in line.lower()):
                findings.append({
                    "rule_id": "rules.security.sql-injection",
                    "severity": "critical",
                    "message": "Potential SQL Injection. Avoid building raw SQL queries using string concatenation. Use parameterized bindings.",
                    "line_start": line_num,
                    "line_end": line_num,
                    "category": "security"
                })
                
            # Secrets
            if secret_pattern.search(line):
                findings.append({
                    "rule_id": "rules.security.hardcoded-secret",
                    "severity": "critical",
                    "message": "Potential hardcoded credentials/secret key found in source code. Load secrets from environment variables or a vault instead.",
                    "line_start": line_num,
                    "line_end": line_num,
                    "category": "security"
                })
                
            # Eval/Exec
            if eval_pattern.search(line):
                findings.append({
                    "rule_id": "rules.security.dynamic-execution",
                    "severity": "high",
                    "message": "Use of eval() or exec() detected. Dynamic evaluation of strings is highly dangerous and can lead to Remote Code Execution (RCE).",
                    "line_start": line_num,
                    "line_end": line_num,
                    "category": "security"
                })
                
            # Subprocess Shell=True
            if shell_pattern.search(line) and "subprocess" in line:
                findings.append({
                    "rule_id": "rules.security.subprocess-shell-true",
                    "severity": "high",
                    "message": "Running subprocess with shell=True is dangerous. It spawns an intermediate shell process, opening up risks for Shell Injection.",
                    "line_start": line_num,
                    "line_end": line_num,
                    "category": "security"
                })
                
        return findings
import re
static_analyzer = StaticAnalyzer()
