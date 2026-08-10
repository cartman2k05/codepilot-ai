import re
import logging
from typing import Dict, List

logger = logging.getLogger("codepilot.static_analysis")

class StaticAnalyzer:
    async def run_pattern_scan(self, code: str, language: str, filename: str) -> List[Dict]:
        """
        Pattern-based static analysis using regex rules to detect common security issues.
        Detects: SQL injection, hardcoded secrets, dynamic code execution, shell injection.
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

static_analyzer = StaticAnalyzer()
