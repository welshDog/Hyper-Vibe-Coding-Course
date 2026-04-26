"""
Semantic Search Module for AI Hub

Provides vector-based semantic search capabilities for discovering
AI resources programmatically.
"""

import json
import os
import hashlib
from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass, asdict
from pathlib import Path
import numpy as np
from datetime import datetime


@dataclass
class SearchResult:
    """Represents a search result with relevance scoring."""
    name: str
    type: str
    version: str
    description: str
    relevance_score: float
    metadata: Dict[str, Any]
    path: str
    tags: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class VectorIndex:
    """Simple vector index for semantic search (production uses FAISS/Milvus)."""
    
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.vectors = []
        self.metadata = []
        
    def add(self, vector: np.ndarray, metadata: Dict[str, Any]):
        """Add a vector with metadata to the index."""
        if len(vector) != self.dimension:
            raise ValueError(f"Vector dimension mismatch: {len(vector)} != {self.dimension}")
        self.vectors.append(vector)
        self.metadata.append(metadata)
        
    def search(self, query_vector: np.ndarray, k: int = 10) -> List[tuple]:
        """Search for k nearest neighbors using cosine similarity."""
        if not self.vectors:
            return []
            
        vectors = np.array(self.vectors)
        # Normalize vectors
        vectors_norm = vectors / (np.linalg.norm(vectors, axis=1, keepdims=True) + 1e-8)
        query_norm = query_vector / (np.linalg.norm(query_vector) + 1e-8)
        
        # Compute cosine similarity
        similarities = np.dot(vectors_norm, query_norm)
        
        # Get top k
        top_k_indices = np.argsort(similarities)[::-1][:k]
        
        return [(self.metadata[i], float(similarities[i])) for i in top_k_indices]


class ResourceIndex:
    """Manages the resource index for fast lookup."""
    
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.index_file = self.repo_path / ".ai_hub" / "resource_index.json"
        self.vector_index = VectorIndex()
        self.resource_cache = {}
        
    def build_index(self) -> Dict[str, Any]:
        """Build the complete resource index from repository."""
        index = {
            "version": "1.0.0",
            "generated_at": datetime.utcnow().isoformat(),
            "resources": {},
            "stats": {
                "total": 0,
                "by_type": {},
                "by_tag": {}
            }
        }
        
        # Scan all directories
        for category in ["frameworks", "datasets", "models", "tutorials", "benchmarks", "tools"]:
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
                            index["resources"][resource_id] = {
                                "path": str(item.relative_to(self.repo_path)),
                                "metadata": metadata
                            }
                            
                            # Update stats
                            index["stats"]["total"] += 1
                            index["stats"]["by_type"][category] = index["stats"]["by_type"].get(category, 0) + 1
                            
                            for tag in metadata.get("tags", []):
                                index["stats"]["by_tag"][tag] = index["stats"]["by_tag"].get(tag, 0) + 1
                                
                        except Exception as e:
                            print(f"Warning: Could not index {item}: {e}")
        
        # Save index
        self.index_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.index_file, 'w') as f:
            json.dump(index, f, indent=2)
            
        self.resource_cache = index["resources"]
        return index
    
    def load_index(self) -> Dict[str, Any]:
        """Load existing index."""
        if self.index_file.exists():
            with open(self.index_file) as f:
                index = json.load(f)
                self.resource_cache = index["resources"]
                return index
        return self.build_index()
    
    def get_resource(self, resource_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific resource by ID."""
        return self.resource_cache.get(resource_id)


class SemanticSearch:
    """
    Semantic search engine for AI Hub resources.
    
    Enables AI systems to discover compatible components through
    natural language queries and structured filters.
    """
    
    def __init__(self, repo_path: str = ".", embedding_model: str = "default"):
        self.repo_path = Path(repo_path)
        self.index = ResourceIndex(repo_path)
        self.embedding_model = embedding_model
        self.vector_index = VectorIndex()
        
        # Load or build index
        self.resource_index = self.index.load_index()
        self._build_vector_index()
        
    def _build_vector_index(self):
        """Build vector index from resource descriptions."""
        for resource_id, resource_data in self.resource_index.get("resources", {}).items():
            metadata = resource_data.get("metadata", {})
            description = metadata.get("description", "")
            
            # Create simple embedding (production uses sentence-transformers)
            embedding = self._create_embedding(description)
            
            self.vector_index.add(embedding, {
                "id": resource_id,
                "metadata": metadata
            })
    
    def _create_embedding(self, text: str) -> np.ndarray:
        """Create embedding vector from text (simplified for demo)."""
        # In production, use sentence-transformers or similar
        # This is a simplified hash-based embedding for demonstration
        hash_obj = hashlib.md5(text.lower().encode())
        hash_bytes = hash_obj.digest()
        
        # Create 384-dimensional vector
        vector = np.zeros(384)
        for i in range(384):
            vector[i] = (hash_bytes[i % 16] / 255.0) * 2 - 1
            
        return vector
    
    def find(
        self,
        query: str = "",
        resource_type: Optional[str] = None,
        framework: Optional[str] = None,
        compatibility_version: Optional[str] = None,
        tags: Optional[List[str]] = None,
        task_type: Optional[str] = None,
        input_modality: Optional[str] = None,
        output_modality: Optional[str] = None,
        min_score: float = 0.0,
        limit: int = 10
    ) -> List[SearchResult]:
        """
        Search for resources matching the query and filters.
        
        Args:
            query: Natural language search query
            resource_type: Filter by type (framework, dataset, model, etc.)
            framework: Filter by framework (pytorch, tensorflow, etc.)
            compatibility_version: Minimum compatible version
            tags: Required tags
            task_type: Filter by task type
            input_modality: Filter by input modality
            output_modality: Filter by output modality
            min_score: Minimum relevance score (0-1)
            limit: Maximum number of results
            
        Returns:
            List of SearchResult objects sorted by relevance
        """
        results = []
        
        # Get candidates from vector search if query provided
        if query:
            query_embedding = self._create_embedding(query)
            candidates = self.vector_index.search(query_embedding, k=limit * 3)
        else:
            # Return all resources if no query
            candidates = [
                ({"id": rid, "metadata": rdata["metadata"]}, 1.0)
                for rid, rdata in self.resource_index.get("resources", {}).items()
            ]
        
        # Apply filters
        for metadata, score in candidates:
            if score < min_score:
                continue
                
            resource_id = metadata["id"]
            resource_meta = metadata["metadata"]
            
            # Type filter
            if resource_type and resource_meta.get("type") != resource_type:
                continue
                
            # Framework filter
            if framework:
                resource_frameworks = resource_meta.get("tags", [])
                if framework not in resource_frameworks:
                    continue
                    
            # Version compatibility filter
            if compatibility_version:
                if not self._check_version_compatibility(
                    resource_meta.get("version", "0.0.0"),
                    compatibility_version
                ):
                    continue
                    
            # Tags filter
            if tags:
                resource_tags = set(resource_meta.get("tags", []))
                if not set(tags).issubset(resource_tags):
                    continue
                    
            # Task type filter
            if task_type:
                ai_discover = resource_meta.get("ai_discoverability", {})
                if task_type not in ai_discover.get("task_types", []):
                    continue
                    
            # Modality filters
            if input_modality:
                ai_discover = resource_meta.get("ai_discoverability", {})
                if input_modality not in ai_discover.get("input_modalities", []):
                    continue
                    
            if output_modality:
                ai_discover = resource_meta.get("ai_discoverability", {})
                if output_modality not in ai_discover.get("output_modalities", []):
                    continue
            
            # Create result
            result = SearchResult(
                name=resource_meta.get("name", resource_id),
                type=resource_meta.get("type", "unknown"),
                version=resource_meta.get("version", "0.0.0"),
                description=resource_meta.get("description", ""),
                relevance_score=score,
                metadata=resource_meta,
                path=resource_id,
                tags=resource_meta.get("tags", [])
            )
            results.append(result)
        
        # Sort by relevance and limit
        results.sort(key=lambda x: x.relevance_score, reverse=True)
        return results[:limit]
    
    def _check_version_compatibility(self, resource_version: str, required: str) -> bool:
        """Check if resource version meets requirement."""
        # Simplified version check (production uses packaging.version)
        try:
            rv_parts = [int(x) for x in resource_version.split(".")[:3]]
            req = required.lstrip(">=<") if required[0] in ">=<" else required
            req_parts = [int(x) for x in req.split(".")[:3]]
            
            if required.startswith(">="):
                return rv_parts >= req_parts
            elif required.startswith(">"):
                return rv_parts > req_parts
            elif required.startswith("<="):
                return rv_parts <= req_parts
            elif required.startswith("<"):
                return rv_parts < req_parts
            else:
                return rv_parts == req_parts
        except:
            return True
    
    def get_compatible_resources(
        self,
        resource_id: str,
        relationship: str = "dependency"
    ) -> List[SearchResult]:
        """
        Find resources compatible with a given resource.
        
        Args:
            resource_id: The resource to find compatible items for
            relationship: Type of relationship (dependency, alternative, complementary)
            
        Returns:
            List of compatible resources
        """
        resource = self.index.get_resource(resource_id)
        if not resource:
            return []
            
        metadata = resource.get("metadata", {})
        tags = metadata.get("tags", [])
        
        # Find resources with similar tags
        return self.find(
            tags=tags[:2] if len(tags) >= 2 else tags,
            limit=5
        )
    
    def discover_for_task(
        self,
        task_description: str,
        available_hardware: Optional[Dict[str, Any]] = None
    ) -> Dict[str, List[SearchResult]]:
        """
        Discover complete solution stacks for a given task.
        
        Args:
            task_description: Description of the AI task
            available_hardware: Hardware constraints (GPU, memory, etc.)
            
        Returns:
            Dictionary with recommended frameworks, models, and datasets
        """
        # Search for each component type
        frameworks = self.find(
            query=task_description,
            resource_type="framework",
            limit=3
        )
        
        models = self.find(
            query=task_description,
            resource_type="model",
            limit=5
        )
        
        datasets = self.find(
            query=task_description,
            resource_type="dataset",
            limit=3
        )
        
        return {
            "frameworks": frameworks,
            "models": models,
            "datasets": datasets,
            "recommended_stack": self._recommend_stack(frameworks, models, datasets)
        }
    
    def _recommend_stack(
        self,
        frameworks: List[SearchResult],
        models: List[SearchResult],
        datasets: List[SearchResult]
    ) -> Dict[str, Any]:
        """Recommend optimal stack based on compatibility."""
        if not frameworks or not models:
            return {}
            
        # Simple recommendation: highest scoring compatible items
        return {
            "framework": frameworks[0].name if frameworks else None,
            "model": models[0].name if models else None,
            "dataset": datasets[0].name if datasets else None,
            "compatibility_score": (frameworks[0].relevance_score + models[0].relevance_score) / 2
        }