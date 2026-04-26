"""
AI Autonomy Client for AI Hub

Enables external AI systems to autonomously discover, integrate,
and upgrade themselves using resources from the repository.
"""

import os
import json
import subprocess
import time
from typing import Dict, Any, List, Optional, Callable
from pathlib import Path
from dataclasses import dataclass, asdict
from datetime import datetime

from .search import SemanticSearch
from .metadata import ResourceMetadata, MetadataValidator
from .compatibility import CompatibilityChecker


@dataclass
class AutonomySession:
    """Tracks an AI autonomy session."""
    session_id: str
    started_at: str
    completed_at: Optional[str] = None
    actions: List[Dict[str, Any]] = None
    status: str = "active"
    
    def __post_init__(self):
        if self.actions is None:
            self.actions = []
    
    def add_action(self, action: str, details: Dict[str, Any]):
        """Add an action to the session log."""
        self.actions.append({
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "details": details
        })
    
    def complete(self, status: str = "success"):
        """Mark session as complete."""
        self.completed_at = datetime.utcnow().isoformat()
        self.status = status
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class AIAutonomyClient:
    """
    Client enabling AI systems to autonomously interact with AI Hub.
    
    Provides a complete API for:
    - Repository discovery and cloning
    - Semantic search for resources
    - Compatibility checking
    - Self-upgrading capabilities
    """
    
    def __init__(
        self,
        repo_url: str = "https://github.com/welshDog/AI.git",
        local_path: str = "./ai-hub-clone",
        timeout: int = 300
    ):
        self.repo_url = repo_url
        self.local_path = Path(local_path)
        self.timeout = timeout
        self.search_engine: Optional[SemanticSearch] = None
        self.compatibility_checker: Optional[CompatibilityChecker] = None
        self.session: Optional[AutonomySession] = None
        self._performance_metrics = {
            "clone_time": 0,
            "index_time": 0,
            "search_time": 0,
            "upgrade_time": 0
        }
    
    def initialize(self) -> Dict[str, Any]:
        """
        Initialize the autonomy client.
        
        Returns:
            Status report of initialization
        """
        start_time = time.time()
        
        self.session = AutonomySession(
            session_id=f"autonomy-{int(start_time)}",
            started_at=datetime.utcnow().isoformat()
        )
        
        # Step 1: Clone repository
        clone_result = self._clone_repository()
        self.session.add_action("clone", clone_result)
        
        if not clone_result["success"]:
            self.session.complete("failed")
            return {
                "success": False,
                "error": clone_result.get("error"),
                "session": self.session.to_dict()
            }
        
        self._performance_metrics["clone_time"] = time.time() - start_time
        
        # Step 2: Initialize search engine
        index_start = time.time()
        self.search_engine = SemanticSearch(str(self.local_path))
        self.compatibility_checker = CompatibilityChecker(str(self.local_path))
        self._performance_metrics["index_time"] = time.time() - index_start
        
        self.session.add_action("index", {
            "success": True,
            "resources_indexed": len(self.search_engine.resource_index.get("resources", {}))
        })
        
        init_time = time.time() - start_time
        
        return {
            "success": True,
            "initialization_time": init_time,
            "performance_metrics": self._performance_metrics,
            "session": self.session.to_dict(),
            "capabilities": [
                "search",
                "compatibility_check",
                "self_upgrade",
                "resource_discovery"
            ]
        }
    
    def _clone_repository(self) -> Dict[str, Any]:
        """Clone the AI Hub repository."""
        try:
            # Remove existing clone if present
            if self.local_path.exists():
                import shutil
                shutil.rmtree(self.local_path)
            
            # Clone repository
            result = subprocess.run(
                ["git", "clone", "--depth", "1", self.repo_url, str(self.local_path)],
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "path": str(self.local_path),
                    "stdout": result.stdout
                }
            else:
                return {
                    "success": False,
                    "error": result.stderr
                }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": f"Clone operation timed out after {self.timeout}s"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def search(
        self,
        query: str,
        resource_type: Optional[str] = None,
        limit: int = 10,
        **filters
    ) -> Dict[str, Any]:
        """
        Search for resources in the repository.
        
        Args:
            query: Search query
            resource_type: Filter by resource type
            limit: Maximum results
            **filters: Additional filters
            
        Returns:
            Search results with metadata
        """
        if not self.search_engine:
            raise RuntimeError("Client not initialized. Call initialize() first.")
        
        search_start = time.time()
        
        results = self.search_engine.find(
            query=query,
            resource_type=resource_type,
            limit=limit,
            **filters
        )
        
        search_time = time.time() - search_start
        self._performance_metrics["search_time"] = search_time
        
        if self.session:
            self.session.add_action("search", {
                "query": query,
                "results_count": len(results),
                "search_time": search_time
            })
        
        return {
            "query": query,
            "results_count": len(results),
            "search_time": search_time,
            "results": [r.to_dict() for r in results]
        }
    
    def check_compatibility(
        self,
        resource_id: str,
        environment: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Check if a resource is compatible with the environment.
        
        Args:
            resource_id: Resource to check
            environment: Environment specifications
            
        Returns:
            Compatibility report
        """
        if not self.compatibility_checker:
            raise RuntimeError("Client not initialized. Call initialize() first.")
        
        report = self.compatibility_checker.check_resource(resource_id, environment)
        
        if self.session:
            self.session.add_action("compatibility_check", {
                "resource_id": resource_id,
                "is_compatible": report.is_compatible
            })
        
        return report.to_dict()
    
    def discover_stack(
        self,
        task_description: str,
        hardware_constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Discover a complete solution stack for a task.
        
        Args:
            task_description: Description of the AI task
            hardware_constraints: Hardware limitations
            
        Returns:
            Recommended stack with compatibility info
        """
        if not self.search_engine:
            raise RuntimeError("Client not initialized. Call initialize() first.")
        
        discovery = self.search_engine.discover_for_task(
            task_description,
            hardware_constraints
        )
        
        # Check compatibility of recommended stack
        stack = discovery.get("recommended_stack", {})
        if stack.get("framework") and stack.get("model"):
            # Find resource IDs
            framework_results = self.search(
                query=stack["framework"],
                resource_type="framework",
                limit=1
            )
            model_results = self.search(
                query=stack["model"],
                resource_type="model",
                limit=1
            )
            
            if framework_results["results"] and model_results["results"]:
                framework_id = framework_results["results"][0]["path"]
                model_id = model_results["results"][0]["path"]
                
                compat_report = self.compatibility_checker.check_stack_compatibility(
                    [framework_id, model_id],
                    hardware_constraints
                )
                
                discovery["compatibility"] = compat_report
        
        if self.session:
            self.session.add_action("discover_stack", {
                "task": task_description,
                "stack": stack
            })
        
        return discovery
    
    def self_upgrade(
        self,
        current_components: List[str],
        target_capabilities: List[str],
        dry_run: bool = True
    ) -> Dict[str, Any]:
        """
        Plan or execute a self-upgrade using repository resources.
        
        Args:
            current_components: Currently installed components
            target_capabilities: Desired new capabilities
            dry_run: If True, only plan without executing
            
        Returns:
            Upgrade plan or execution result
        """
        upgrade_start = time.time()
        
        # Search for components providing target capabilities
        new_components = []
        for capability in target_capabilities:
            results = self.search(
                query=capability,
                limit=3
            )
            if results["results"]:
                new_components.append({
                    "capability": capability,
                    "recommended_resource": results["results"][0]
                })
        
        # Check compatibility
        all_components = current_components + [
            c["recommended_resource"]["path"] for c in new_components
        ]
        
        compat_report = self.compatibility_checker.check_stack_compatibility(
            all_components
        )
        
        upgrade_plan = {
            "current_components": current_components,
            "target_capabilities": target_capabilities,
            "recommended_additions": new_components,
            "compatibility": compat_report,
            "installation_commands": self._generate_install_commands(new_components),
            "dry_run": dry_run
        }
        
        if not dry_run and compat_report["overall_compatible"]:
            # Execute upgrade
            execution_result = self._execute_upgrade(new_components)
            upgrade_plan["execution"] = execution_result
        
        self._performance_metrics["upgrade_time"] = time.time() - upgrade_start
        
        if self.session:
            self.session.add_action("self_upgrade", {
                "components_added": len(new_components),
                "compatible": compat_report["overall_compatible"],
                "dry_run": dry_run
            })
        
        return upgrade_plan
    
    def _generate_install_commands(
        self,
        components: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate installation commands for components."""
        commands = []
        
        for comp in components:
            resource = comp.get("recommended_resource", {})
            metadata = resource.get("metadata", {})
            install = metadata.get("installation", {})
            
            if install.get("pip"):
                commands.append(install["pip"])
            elif install.get("command"):
                commands.append(install["command"])
        
        return commands
    
    def _execute_upgrade(
        self,
        components: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Execute the upgrade plan."""
        results = []
        
        for comp in components:
            resource = comp.get("recommended_resource", {})
            metadata = resource.get("metadata", {})
            install = metadata.get("installation", {})
            
            command = install.get("pip") or install.get("command")
            if command:
                try:
                    result = subprocess.run(
                        command.split(),
                        capture_output=True,
                        text=True,
                        timeout=120
                    )
                    results.append({
                        "resource": resource.get("name"),
                        "success": result.returncode == 0,
                        "output": result.stdout if result.returncode == 0 else result.stderr
                    })
                except Exception as e:
                    results.append({
                        "resource": resource.get("name"),
                        "success": False,
                        "error": str(e)
                    })
        
        return {
            "executed_at": datetime.utcnow().isoformat(),
            "results": results,
            "overall_success": all(r["success"] for r in results)
        }
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Get performance metrics for all operations."""
        return {
            "metrics": self._performance_metrics,
            "total_time": sum(self._performance_metrics.values()),
            "within_target": sum(self._performance_metrics.values()) < 300  # 5 minutes
        }
    
    def complete_session(self) -> Dict[str, Any]:
        """Complete the autonomy session and return summary."""
        if self.session:
            self.session.complete()
            
            return {
                "session": self.session.to_dict(),
                "performance": self.get_performance_report(),
                "success": True
            }
        
        return {"success": False, "error": "No active session"}
    
    def run_full_autonomy_test(self) -> Dict[str, Any]:
        """
        Run the complete 5-minute autonomy test.
        
        This test proves that an external AI can:
        1. Clone the repository
        2. Search for resources
        3. Check compatibility
        4. Discover solution stacks
        5. Plan self-upgrades
        
        Returns:
            Complete test results with timing
        """
        print("🚀 Starting AI Autonomy Test...")
        overall_start = time.time()
        
        # Step 1: Initialize (clone + index)
        print("📥 Step 1: Cloning and indexing repository...")
        init_result = self.initialize()
        if not init_result["success"]:
            return {
                "success": False,
                "stage": "initialization",
                "error": init_result.get("error"),
                "time_elapsed": time.time() - overall_start
            }
        print(f"✅ Repository cloned and indexed in {init_result['initialization_time']:.2f}s")
        
        # Step 2: Search for resources
        print("🔍 Step 2: Searching for AI resources...")
        search_queries = [
            "transformer model for NLP",
            "computer vision CNN",
            "reinforcement learning framework"
        ]
        search_results = []
        for query in search_queries:
            result = self.search(query, limit=5)
            search_results.append({
                "query": query,
                "found": result["results_count"] > 0
            })
        print(f"✅ Completed {len(search_queries)} search queries")
        
        # Step 3: Check compatibility
        print("✅ Step 3: Checking compatibility...")
        environment = {
            "python": "3.9.0",
            "platform": "linux",
            "cuda": "11.8",
            "packages": {
                "torch": "2.0.0",
                "numpy": "1.24.0"
            }
        }
        
        # Get a resource to check
        sample_search = self.search("pytorch", resource_type="framework", limit=1)
        if sample_search["results"]:
            resource_id = sample_search["results"][0]["path"]
            compat_result = self.check_compatibility(resource_id, environment)
            print(f"✅ Compatibility check completed for {resource_id}")
        
        # Step 4: Discover solution stack
        print("🎯 Step 4: Discovering solution stack...")
        stack = self.discover_stack(
            "sentiment analysis on text data",
            {"gpu_memory": "8GB"}
        )
        print(f"✅ Stack discovery completed")
        
        # Step 5: Plan self-upgrade
        print("⬆️  Step 5: Planning self-upgrade...")
        upgrade_plan = self.self_upgrade(
            current_components=["numpy", "requests"],
            target_capabilities=["transformer inference", "text embedding"],
            dry_run=True
        )
        print(f"✅ Self-upgrade plan generated")
        
        # Complete session
        session_summary = self.complete_session()
        
        total_time = time.time() - overall_start
        
        return {
            "success": True,
            "total_time_seconds": total_time,
            "within_5_minutes": total_time < 300,
            "stages_completed": [
                "repository_clone",
                "resource_indexing",
                "semantic_search",
                "compatibility_check",
                "stack_discovery",
                "self_upgrade_planning"
            ],
            "initialization": init_result,
            "search_results": search_results,
            "compatibility": compat_result if sample_search["results"] else None,
            "discovered_stack": stack.get("recommended_stack"),
            "upgrade_plan": upgrade_plan,
            "session": session_summary,
            "performance": self.get_performance_report()
        }