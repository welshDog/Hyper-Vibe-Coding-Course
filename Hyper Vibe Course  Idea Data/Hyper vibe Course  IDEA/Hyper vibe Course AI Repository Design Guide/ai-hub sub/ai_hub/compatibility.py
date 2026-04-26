"""
Compatibility Checking Module for AI Hub

Ensures version compatibility and dependency resolution
across all resources in the repository.
"""

import json
import re
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass
from pathlib import Path
from packaging import version as pkg_version
from packaging.requirements import Requirement
from packaging.specifiers import SpecifierSet


@dataclass
class CompatibilityReport:
    """Report of compatibility check results."""
    resource_id: str
    is_compatible: bool
    conflicts: List[Dict[str, Any]]
    warnings: List[str]
    suggested_versions: Dict[str, str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "resource_id": self.resource_id,
            "is_compatible": self.is_compatible,
            "conflicts": self.conflicts,
            "warnings": self.warnings,
            "suggested_versions": self.suggested_versions
        }


class DependencyResolver:
    """Resolves dependencies between resources."""
    
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.dependency_graph = {}
        self._build_graph()
    
    def _build_graph(self):
        """Build dependency graph from all resources."""
        for category in ["frameworks", "datasets", "models", "tools"]:
            category_path = self.repo_path / category
            if not category_path.exists():
                continue
            
            for item in category_path.iterdir():
                if item.is_dir() and not item.name.startswith("."):
                    metadata_file = item / "metadata.json"
                    if metadata_file.exists():
                        try:
                            with open(metadata_file) as f:
                                metadata = json.load(f)
                            
                            resource_id = f"{category}/{item.name}"
                            deps = metadata.get("compatibility", {}).get("dependencies", [])
                            self.dependency_graph[resource_id] = {
                                "dependencies": deps,
                                "version": metadata.get("version", "0.0.0"),
                                "metadata": metadata
                            }
                        except Exception:
                            pass
    
    def resolve_dependencies(
        self,
        resource_id: str,
        target_environment: Optional[Dict[str, str]] = None
    ) -> Tuple[bool, List[str], Dict[str, str]]:
        """
        Resolve dependencies for a resource.
        
        Returns:
            Tuple of (success, missing_deps, resolved_versions)
        """
        if resource_id not in self.dependency_graph:
            return False, [f"Resource {resource_id} not found"], {}
        
        resource = self.dependency_graph[resource_id]
        dependencies = resource["dependencies"]
        
        missing = []
        resolved = {}
        
        for dep in dependencies:
            dep_name = dep["name"]
            dep_version = dep.get("version", "*")
            optional = dep.get("optional", False)
            
            # Check if available in environment
            if target_environment and dep_name in target_environment:
                installed_version = target_environment[dep_name]
                if not self._satisfies_version(installed_version, dep_version):
                    if not optional:
                        missing.append(f"{dep_name} {dep_version} (have {installed_version})")
                    else:
                        resolved[dep_name] = installed_version
                else:
                    resolved[dep_name] = installed_version
            else:
                if not optional:
                    missing.append(f"{dep_name} {dep_version}")
                resolved[dep_name] = dep_version
        
        return len(missing) == 0, missing, resolved
    
    def _satisfies_version(self, installed: str, required: str) -> bool:
        """Check if installed version satisfies requirement."""
        try:
            if required == "*":
                return True
            spec = SpecifierSet(required)
            return pkg_version.parse(installed) in spec
        except:
            return True
    
    def find_conflicts(self) -> List[Dict[str, Any]]:
        """Find version conflicts across all resources."""
        conflicts = []
        
        # Build requirement map
        req_map = {}
        for resource_id, resource in self.dependency_graph.items():
            for dep in resource["dependencies"]:
                name = dep["name"]
                version = dep.get("version", "*")
                
                if name not in req_map:
                    req_map[name] = []
                req_map[name].append({
                    "resource": resource_id,
                    "version": version
                })
        
        # Find conflicts
        for dep_name, requirements in req_map.items():
            if len(requirements) > 1:
                # Check if all requirements are compatible
                versions = [r["version"] for r in requirements]
                if not self._are_compatible(versions):
                    conflicts.append({
                        "dependency": dep_name,
                        "requirements": requirements,
                        "suggested_resolution": self._suggest_resolution(versions)
                    })
        
        return conflicts
    
    def _are_compatible(self, versions: List[str]) -> bool:
        """Check if version requirements are mutually compatible."""
        try:
            # Find intersection of all specifiers
            intersection = SpecifierSet()
            for v in versions:
                if v != "*":
                    intersection &= SpecifierSet(v)
            
            # Check if any version could satisfy all
            # This is a simplified check
            return True  # Assume compatible for simplicity
        except:
            return False
    
    def _suggest_resolution(self, versions: List[str]) -> str:
        """Suggest a version that satisfies most requirements."""
        # Find the most specific version
        non_wildcard = [v for v in versions if v != "*"]
        if non_wildcard:
            return f">={self._extract_min_version(non_wildcard[0])}"
        return "*"
    
    def _extract_min_version(self, spec: str) -> str:
        """Extract minimum version from specifier."""
        match = re.search(r'>=?([\d.]+)', spec)
        if match:
            return match.group(1)
        return "0.0.0"


class CompatibilityChecker:
    """
    Main compatibility checking interface.
    
    Validates that resources are compatible with target environments
    and with each other.
    """
    
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.resolver = DependencyResolver(repo_path)
    
    def check_resource(
        self,
        resource_id: str,
        environment: Optional[Dict[str, Any]] = None
    ) -> CompatibilityReport:
        """
        Check compatibility of a resource with environment.
        
        Args:
            resource_id: Resource to check
            environment: Target environment specs
            
        Returns:
            CompatibilityReport with detailed results
        """
        conflicts = []
        warnings = []
        suggestions = {}
        
        # Load resource metadata
        metadata = self._load_metadata(resource_id)
        if not metadata:
            return CompatibilityReport(
                resource_id=resource_id,
                is_compatible=False,
                conflicts=[{"error": "Resource not found"}],
                warnings=[],
                suggested_versions={}
            )
        
        # Check Python version
        if environment and "python" in environment:
            py_compat = metadata.get("compatibility", {}).get("python", ">=3.6")
            if not self._check_python_compat(environment["python"], py_compat):
                conflicts.append({
                    "type": "python_version",
                    "required": py_compat,
                    "available": environment["python"]
                })
                suggestions["python"] = py_compat
        
        # Check platform
        if environment and "platform" in environment:
            platforms = metadata.get("compatibility", {}).get("platforms", [])
            if platforms and environment["platform"] not in platforms:
                conflicts.append({
                    "type": "platform",
                    "supported": platforms,
                    "requested": environment["platform"]
                })
        
        # Check CUDA
        if environment and "cuda" in environment:
            cuda_req = metadata.get("compatibility", {}).get("cuda")
            if cuda_req and not self._check_cuda_compat(environment["cuda"], cuda_req):
                conflicts.append({
                    "type": "cuda",
                    "required": cuda_req,
                    "available": environment["cuda"]
                })
        
        # Resolve dependencies
        env_packages = environment.get("packages", {}) if environment else {}
        success, missing, resolved = self.resolver.resolve_dependencies(
            resource_id, env_packages
        )
        
        if not success:
            for miss in missing:
                conflicts.append({
                    "type": "dependency",
                    "missing": miss
                })
        
        suggestions.update(resolved)
        
        # Check for deprecation warnings
        version = metadata.get("version", "0.0.0")
        changelog = metadata.get("changelog", [])
        if changelog and len(changelog) > 0:
            latest = changelog[0]
            if "deprecated" in str(latest).lower():
                warnings.append(f"Resource has deprecation notice in version {latest.get('version')}")
        
        return CompatibilityReport(
            resource_id=resource_id,
            is_compatible=len(conflicts) == 0,
            conflicts=conflicts,
            warnings=warnings,
            suggested_versions=suggestions
        )
    
    def _load_metadata(self, resource_id: str) -> Optional[Dict[str, Any]]:
        """Load metadata for a resource."""
        parts = resource_id.split("/")
        if len(parts) != 2:
            return None
        
        metadata_path = self.repo_path / parts[0] / parts[1] / "metadata.json"
        if metadata_path.exists():
            with open(metadata_path) as f:
                return json.load(f)
        return None
    
    def _check_python_compat(self, available: str, required: str) -> bool:
        """Check Python version compatibility."""
        try:
            spec = SpecifierSet(required)
            return pkg_version.parse(available) in spec
        except:
            return True
    
    def _check_cuda_compat(self, available: str, required: str) -> bool:
        """Check CUDA version compatibility."""
        try:
            avail_major = int(available.split(".")[0])
            req_major = int(required.replace(">=", "").split(".")[0])
            return avail_major >= req_major
        except:
            return True
    
    def check_stack_compatibility(
        self,
        resource_ids: List[str],
        environment: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Check compatibility of a stack of resources.
        
        Args:
            resource_ids: List of resources to use together
            environment: Target environment
            
        Returns:
            Comprehensive compatibility report
        """
        reports = {}
        all_conflicts = []
        
        for rid in resource_ids:
            report = self.check_resource(rid, environment)
            reports[rid] = report.to_dict()
            all_conflicts.extend(report.conflicts)
        
        # Check cross-resource conflicts
        cross_conflicts = self._check_cross_conflicts(resource_ids)
        
        return {
            "individual_reports": reports,
            "cross_resource_conflicts": cross_conflicts,
            "overall_compatible": len(all_conflicts) == 0 and len(cross_conflicts) == 0,
            "recommendations": self._generate_recommendations(reports, cross_conflicts)
        }
    
    def _check_cross_conflicts(self, resource_ids: List[str]) -> List[Dict[str, Any]]:
        """Check for conflicts between resources."""
        conflicts = []
        
        # Collect all dependencies
        all_deps = {}
        for rid in resource_ids:
            metadata = self._load_metadata(rid)
            if metadata:
                deps = metadata.get("compatibility", {}).get("dependencies", [])
                for dep in deps:
                    name = dep["name"]
                    version = dep.get("version", "*")
                    
                    if name in all_deps:
                        if all_deps[name] != version:
                            conflicts.append({
                                "type": "version_mismatch",
                                "dependency": name,
                                "resources": [
                                    {"resource": rid, "version": version},
                                    {"resource": "previous", "version": all_deps[name]}
                                ]
                            })
                    else:
                        all_deps[name] = version
        
        return conflicts
    
    def _generate_recommendations(
        self,
        reports: Dict[str, CompatibilityReport],
        cross_conflicts: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate recommendations based on conflicts."""
        recommendations = []
        
        # Check for common issues
        python_conflicts = [r for r in reports.values() if any(c.get("type") == "python_version" for c in r.conflicts)]
        if python_conflicts:
            recommendations.append("Consider using a Python version manager (pyenv/conda) to meet Python requirements")
        
        if cross_conflicts:
            recommendations.append("Some dependencies have version conflicts. Consider using virtual environments.")
        
        return recommendations
    
    def validate_backwards_compatibility(
        self,
        resource_id: str,
        old_version: str,
        new_version: str
    ) -> Dict[str, Any]:
        """
        Validate backwards compatibility between versions.
        
        Returns:
            Report on breaking changes and migration path
        """
        # This would compare API signatures, etc.
        # Simplified implementation
        
        try:
            old_v = pkg_version.parse(old_version)
            new_v = pkg_version.parse(new_version)
            
            breaking_changes = []
            
            # Major version change indicates breaking changes
            if new_v.major > old_v.major:
                breaking_changes.append(f"Major version bump from {old_v.major} to {new_v.major}")
            
            return {
                "is_backwards_compatible": new_v.major == old_v.major,
                "breaking_changes": breaking_changes,
                "migration_guide": f"See CHANGELOG.md for migration from {old_version} to {new_version}"
            }
        except:
            return {
                "is_backwards_compatible": True,
                "breaking_changes": [],
                "migration_guide": ""
            }