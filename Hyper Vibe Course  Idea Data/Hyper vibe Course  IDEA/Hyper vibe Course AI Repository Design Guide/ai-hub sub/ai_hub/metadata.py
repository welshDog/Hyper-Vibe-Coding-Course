"""
Metadata Management Module for AI Hub

Provides validation, parsing, and management of resource metadata
following the standardized schema.
"""

import json
import os
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
from pathlib import Path
from datetime import datetime


@dataclass
class ResourceMetadata:
    """Standardized resource metadata structure."""
    name: str
    version: str
    type: str
    description: str
    author: Dict[str, str]
    license: str
    compatibility: Dict[str, Any]
    tags: List[str] = field(default_factory=list)
    performance: Dict[str, Any] = field(default_factory=dict)
    resources: Dict[str, str] = field(default_factory=dict)
    installation: Dict[str, str] = field(default_factory=dict)
    usage: Dict[str, Any] = field(default_factory=dict)
    benchmarks: List[Dict[str, Any]] = field(default_factory=list)
    changelog: List[Dict[str, Any]] = field(default_factory=list)
    ai_discoverability: Dict[str, Any] = field(default_factory=dict)
    
    @classmethod
    def from_file(cls, filepath: str) -> "ResourceMetadata":
        """Load metadata from JSON file."""
        with open(filepath) as f:
            data = json.load(f)
        return cls(**data)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ResourceMetadata":
        """Create from dictionary."""
        return cls(**data)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)
    
    def to_file(self, filepath: str):
        """Save metadata to JSON file."""
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
    
    def validate(self) -> Tuple[bool, List[str]]:
        """Validate metadata against schema."""
        errors = []
        
        # Required fields
        if not self.name or not isinstance(self.name, str):
            errors.append("Name must be a non-empty string")
        
        if not self.version:
            errors.append("Version is required")
        elif not self._is_valid_semver(self.version):
            errors.append(f"Version '{self.version}' is not valid semantic versioning")
        
        if self.type not in ["framework", "dataset", "model", "tutorial", "benchmark", "tool"]:
            errors.append(f"Invalid type: {self.type}")
        
        if len(self.description) < 50:
            errors.append("Description must be at least 50 characters")
        
        if not self.author.get("name") or not self.author.get("email"):
            errors.append("Author name and email are required")
        
        valid_licenses = ["MIT", "Apache-2.0", "BSD-3-Clause", "GPL-3.0", 
                         "LGPL-3.0", "Proprietary", "CC-BY-4.0", "CC0-1.0", "Other"]
        if self.license not in valid_licenses:
            errors.append(f"License must be one of: {valid_licenses}")
        
        if not self.compatibility.get("python"):
            errors.append("Python version compatibility is required")
        
        if not self.compatibility.get("platforms"):
            errors.append("At least one platform must be specified")
        
        if not self.tags:
            errors.append("At least one tag is required")
        
        return len(errors) == 0, errors
    
    def _is_valid_semver(self, version: str) -> bool:
        """Check if version follows semantic versioning."""
        import re
        pattern = r'^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$'
        return bool(re.match(pattern, version))
    
    def get_embedding_text(self) -> str:
        """Generate text for embedding/vector search."""
        parts = [
            self.name,
            self.description,
            " ".join(self.tags),
            self.type
        ]
        
        # Add AI discoverability info
        ai_disc = self.ai_discoverability
        if ai_disc.get("task_types"):
            parts.extend(ai_disc["task_types"])
        if ai_disc.get("semantic_categories"):
            parts.extend(ai_disc["semantic_categories"])
            
        return " ".join(parts)
    
    def update_version(self, new_version: str, changes: List[str]):
        """Update version and add changelog entry."""
        old_version = self.version
        self.version = new_version
        
        changelog_entry = {
            "version": new_version,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "changes": changes
        }
        
        self.changelog.insert(0, changelog_entry)
    
    def add_benchmark(self, dataset: str, metric: str, score: float):
        """Add a benchmark result."""
        self.benchmarks.append({
            "dataset": dataset,
            "metric": metric,
            "score": score,
            "date": datetime.utcnow().strftime("%Y-%m-%d")
        })
    
    def is_compatible_with(
        self,
        python_version: Optional[str] = None,
        platform: Optional[str] = None,
        cuda_version: Optional[str] = None
    ) -> bool:
        """Check if resource is compatible with given environment."""
        compat = self.compatibility
        
        if python_version and compat.get("python"):
            if not self._check_version_constraint(python_version, compat["python"]):
                return False
        
        if platform and compat.get("platforms"):
            if platform not in compat["platforms"]:
                return False
        
        if cuda_version and compat.get("cuda"):
            if not self._check_version_constraint(cuda_version, compat["cuda"]):
                return False
        
        return True
    
    def _check_version_constraint(self, version: str, constraint: str) -> bool:
        """Check if version satisfies constraint."""
        # Simplified version checking
        try:
            v_parts = [int(x) for x in version.split(".")[:2]]
            
            if constraint.startswith(">="):
                req = constraint[2:]
                req_parts = [int(x) for x in req.split(".")[:2]]
                return v_parts >= req_parts
            elif constraint.startswith(">"):
                req = constraint[1:]
                req_parts = [int(x) for x in req.split(".")[:2]]
                return v_parts > req_parts
            else:
                req_parts = [int(x) for x in constraint.split(".")[:2]]
                return v_parts == req_parts
        except:
            return True


class MetadataValidator:
    """Validates metadata files against the schema."""
    
    def __init__(self, schema_path: Optional[str] = None):
        self.schema_path = schema_path or self._find_schema()
        self.schema = self._load_schema()
    
    def _find_schema(self) -> str:
        """Find the schema file."""
        possible_paths = [
            "config/metadata-schema.json",
            "../config/metadata-schema.json",
            "../../config/metadata-schema.json"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                return path
        raise FileNotFoundError("Could not find metadata-schema.json")
    
    def _load_schema(self) -> Dict[str, Any]:
        """Load the JSON schema."""
        with open(self.schema_path) as f:
            return json.load(f)
    
    def validate_file(self, filepath: str) -> Tuple[bool, List[str]]:
        """Validate a single metadata file."""
        try:
            with open(filepath) as f:
                data = json.load(f)
            
            metadata = ResourceMetadata.from_dict(data)
            return metadata.validate()
        except json.JSONDecodeError as e:
            return False, [f"Invalid JSON: {e}"]
        except Exception as e:
            return False, [f"Validation error: {e}"]
    
    def validate_directory(self, directory: str) -> Dict[str, Tuple[bool, List[str]]]:
        """Validate all metadata files in a directory."""
        results = {}
        dir_path = Path(directory)
        
        for metadata_file in dir_path.rglob("metadata.json"):
            rel_path = str(metadata_file.relative_to(dir_path))
            results[rel_path] = self.validate_file(str(metadata_file))
        
        return results
    
    def generate_template(
        self,
        resource_type: str,
        name: str = "example-resource"
    ) -> ResourceMetadata:
        """Generate a template metadata object."""
        return ResourceMetadata(
            name=name,
            version="0.1.0",
            type=resource_type,
            description="A comprehensive description of this AI resource (minimum 50 characters).",
            author={
                "name": "Your Name",
                "email": "your.email@example.com",
                "organization": "Your Organization"
            },
            license="MIT",
            compatibility={
                "python": ">=3.8",
                "platforms": ["linux", "darwin", "win32"],
                "dependencies": [
                    {"name": "numpy", "version": ">=1.20.0", "optional": False},
                    {"name": "torch", "version": ">=2.0.0", "optional": True}
                ]
            },
            tags=["nlp", "pytorch"],
            ai_discoverability={
                "task_types": ["classification"],
                "input_modalities": ["text"],
                "output_modalities": ["probability"],
                "semantic_categories": ["machine-learning", "deep-learning"]
            },
            installation={
                "command": "pip install example-resource",
                "pip": "pip install example-resource",
                "conda": "conda install -c conda-forge example-resource"
            },
            usage={
                "quickstart": "import example_resource\nmodel = example_resource.load()",
                "example_code": "# Example usage\nresult = model.predict(data)"
            }
        )
    
    def create_template_file(
        self,
        resource_type: str,
        output_path: str,
        name: Optional[str] = None
    ):
        """Create a template metadata file."""
        name = name or Path(output_path).parent.name
        template = self.generate_template(resource_type, name)
        template.to_file(output_path)


def batch_validate(repo_path: str = ".") -> Dict[str, Any]:
    """
    Validate all metadata in the repository.
    
    Returns:
        Dictionary with validation results and statistics
    """
    validator = MetadataValidator()
    
    results = {
        "valid": [],
        "invalid": [],
        "errors": {},
        "stats": {
            "total": 0,
            "passed": 0,
            "failed": 0
        }
    }
    
    repo = Path(repo_path)
    for category in ["frameworks", "datasets", "models", "tutorials", "benchmarks", "tools"]:
        category_path = repo / category
        if not category_path.exists():
            continue
        
        for item in category_path.iterdir():
            if item.is_dir() and not item.name.startswith("."):
                metadata_file = item / "metadata.json"
                if metadata_file.exists():
                    results["stats"]["total"] += 1
                    
                    is_valid, errors = validator.validate_file(str(metadata_file))
                    resource_id = f"{category}/{item.name}"
                    
                    if is_valid:
                        results["valid"].append(resource_id)
                        results["stats"]["passed"] += 1
                    else:
                        results["invalid"].append(resource_id)
                        results["errors"][resource_id] = errors
                        results["stats"]["failed"] += 1
    
    return results