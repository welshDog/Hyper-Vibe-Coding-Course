"""
AI Hub - Centralized Resource Management for Artificial Intelligence

This package provides tools for discovering, managing, and integrating
AI resources from the world's largest AI repository.
"""

__version__ = "1.0.0"
__author__ = "AI Hub Community"

from .search import SemanticSearch, ResourceIndex
from .metadata import MetadataValidator, ResourceMetadata
from .compatibility import CompatibilityChecker
from .autonomy import AIAutonomyClient

__all__ = [
    "SemanticSearch",
    "ResourceIndex", 
    "MetadataValidator",
    "ResourceMetadata",
    "CompatibilityChecker",
    "AIAutonomyClient",
]