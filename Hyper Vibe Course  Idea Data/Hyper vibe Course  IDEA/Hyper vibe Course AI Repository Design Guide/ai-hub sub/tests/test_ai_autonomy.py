"""
AI Autonomy Test Suite

This test suite proves that an external AI system can autonomously:
1. Clone the AI Hub repository
2. Search for and discover resources
3. Check compatibility
4. Discover solution stacks
5. Plan self-upgrades

Target: Complete within 5 minutes on standard cloud hardware.
"""

import pytest
import time
import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ai_hub import AIAutonomyClient, SemanticSearch, CompatibilityChecker


class TestAIAutonomy:
    """Test suite for AI autonomy capabilities."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for testing."""
        temp_path = tempfile.mkdtemp(prefix="ai_hub_test_")
        yield temp_path
        shutil.rmtree(temp_path, ignore_errors=True)
    
    @pytest.fixture
    def client(self, temp_dir):
        """Create an AIAutonomyClient instance."""
        # Use local path for faster testing
        return AIAutonomyClient(
            repo_url="https://github.com/welshDog/AI.git",
            local_path=os.path.join(temp_dir, "ai-hub"),
            timeout=300
        )
    
    def test_full_autonomy_workflow(self, client):
        """
        Test the complete autonomy workflow within 5 minutes.
        
        This is the main test that proves an external AI can:
        - Clone the repository
        - Initialize search
        - Discover resources
        - Check compatibility
        - Plan upgrades
        """
        start_time = time.time()
        
        # Run full autonomy test
        result = client.run_full_autonomy_test()
        
        elapsed = time.time() - start_time
        
        # Assertions
        assert result["success"], f"Autonomy test failed: {result.get('error')}"
        assert result["within_5_minutes"], f"Test took too long: {elapsed:.2f}s > 300s"
        assert len(result["stages_completed"]) >= 6, "Not all stages completed"
        
        # Print results
        print(f"\n{'='*60}")
        print(f"AI AUTONOMY TEST RESULTS")
        print(f"{'='*60}")
        print(f"Total Time: {elapsed:.2f}s (Target: <300s)")
        print(f"Stages Completed: {len(result['stages_completed'])}")
        print(f"Performance Metrics:")
        for metric, value in result["performance"]["metrics"].items():
            print(f"  - {metric}: {value:.2f}s")
        print(f"{'='*60}\n")
        
        return result
    
    def test_repository_clone(self, client):
        """Test that the repository can be cloned."""
        start_time = time.time()
        
        result = client._clone_repository()
        
        elapsed = time.time() - start_time
        
        assert result["success"], f"Clone failed: {result.get('error')}"
        assert os.path.exists(result["path"]), "Clone path does not exist"
        assert elapsed < 120, f"Clone took too long: {elapsed:.2f}s"
        
        print(f"Repository cloned in {elapsed:.2f}s")
    
    def test_initialization(self, client):
        """Test client initialization (clone + index)."""
        start_time = time.time()
        
        result = client.initialize()
        
        elapsed = time.time() - start_time
        
        assert result["success"], f"Initialization failed: {result.get('error')}"
        assert client.search_engine is not None, "Search engine not initialized"
        assert client.compatibility_checker is not None, "Compatibility checker not initialized"
        assert elapsed < 180, f"Initialization took too long: {elapsed:.2f}s"
        
        print(f"Client initialized in {elapsed:.2f}s")
    
    def test_semantic_search(self, client):
        """Test semantic search functionality."""
        # Initialize first
        client.initialize()
        
        test_queries = [
            ("transformer model", ["model", "framework"]),
            ("NLP dataset", ["dataset"]),
            ("computer vision", ["model", "tutorial"]),
        ]
        
        for query, expected_types in test_queries:
            start_time = time.time()
            
            result = client.search(query, limit=5)
            
            elapsed = time.time() - start_time
            
            assert result["results_count"] > 0, f"No results for query: {query}"
            assert result["search_time"] < 5, f"Search took too long: {result['search_time']:.2f}s"
            assert elapsed < 10, f"Total search time too long: {elapsed:.2f}s"
            
            print(f"Query '{query}': {result['results_count']} results in {elapsed:.3f}s")
    
    def test_compatibility_check(self, client):
        """Test compatibility checking."""
        # Initialize first
        client.initialize()
        
        # Get a resource to check
        search_result = client.search("pytorch", resource_type="framework", limit=1)
        assert search_result["results_count"] > 0, "No framework found"
        
        resource_id = search_result["results"][0]["path"]
        
        environment = {
            "python": "3.9.0",
            "platform": "linux",
            "cuda": "11.8",
            "packages": {
                "torch": "2.0.0",
                "numpy": "1.24.0"
            }
        }
        
        start_time = time.time()
        
        result = client.check_compatibility(resource_id, environment)
        
        elapsed = time.time() - start_time
        
        assert "is_compatible" in result, "Compatibility result missing"
        assert elapsed < 5, f"Compatibility check took too long: {elapsed:.2f}s"
        
        print(f"Compatibility check for {resource_id}: {result['is_compatible']} in {elapsed:.3f}s")
    
    def test_stack_discovery(self, client):
        """Test solution stack discovery."""
        # Initialize first
        client.initialize()
        
        task = "sentiment analysis on customer reviews"
        hardware = {"gpu_memory": "8GB"}
        
        start_time = time.time()
        
        result = client.discover_stack(task, hardware)
        
        elapsed = time.time() - start_time
        
        assert "frameworks" in result, "No frameworks in result"
        assert "models" in result, "No models in result"
        assert "datasets" in result, "No datasets in result"
        assert elapsed < 15, f"Stack discovery took too long: {elapsed:.2f}s"
        
        print(f"Stack discovery: {len(result['frameworks'])} frameworks, "
              f"{len(result['models'])} models, {len(result['datasets'])} datasets "
              f"in {elapsed:.3f}s")
    
    def test_self_upgrade_planning(self, client):
        """Test self-upgrade planning."""
        # Initialize first
        client.initialize()
        
        current = ["numpy", "requests"]
        targets = ["text embedding", "sentiment classification"]
        
        start_time = time.time()
        
        result = client.self_upgrade(
            current_components=current,
            target_capabilities=targets,
            dry_run=True
        )
        
        elapsed = time.time() - start_time
        
        assert "recommended_additions" in result, "No recommendations"
        assert "compatibility" in result, "No compatibility check"
        assert "installation_commands" in result, "No installation commands"
        assert elapsed < 20, f"Upgrade planning took too long: {elapsed:.2f}s"
        
        print(f"Self-upgrade plan: {len(result['recommended_additions'])} additions "
              f"in {elapsed:.3f}s")
    
    def test_performance_requirements(self, client):
        """Test that all operations meet performance requirements."""
        # Run full test
        result = client.run_full_autonomy_test()
        
        assert result["success"], "Autonomy test failed"
        
        metrics = result["performance"]["metrics"]
        
        # Check individual metrics
        assert metrics["clone_time"] < 120, f"Clone too slow: {metrics['clone_time']:.2f}s"
        assert metrics["index_time"] < 30, f"Index too slow: {metrics['index_time']:.2f}s"
        assert metrics["search_time"] < 10, f"Search too slow: {metrics['search_time']:.2f}s"
        assert metrics["upgrade_time"] < 30, f"Upgrade too slow: {metrics['upgrade_time']:.2f}s"
        
        total = sum(metrics.values())
        assert total < 300, f"Total time exceeds 5 minutes: {total:.2f}s"
        
        print(f"Performance check passed: {total:.2f}s total")


class TestEdgeCases:
    """Test edge cases and error handling."""
    
    def test_invalid_resource_id(self):
        """Test handling of invalid resource ID."""
        checker = CompatibilityChecker(".")
        result = checker.check_resource("invalid/resource")
        
        assert not result.is_compatible, "Invalid resource should not be compatible"
        assert len(result.conflicts) > 0, "Should have conflict for invalid resource"
    
    def test_empty_search(self):
        """Test search with no results."""
        search = SemanticSearch(".")
        results = search.find("xyznonexistentquery12345")
        
        assert len(results) == 0, "Should return empty for non-matching query"
    
    def test_version_compatibility(self):
        """Test version compatibility checking."""
        checker = CompatibilityChecker(".")
        
        # Test various version constraints
        assert checker._check_version_constraint("3.9.0", ">=3.8")
        assert checker._check_version_constraint("3.9.0", ">=3.9")
        assert not checker._check_version_constraint("3.7.0", ">=3.8")


@pytest.mark.benchmark
class TestBenchmarks:
    """Performance benchmarks for critical operations."""
    
    def test_search_benchmark(self, benchmark):
        """Benchmark semantic search."""
        search = SemanticSearch(".")
        
        result = benchmark(search.find, "transformer model", limit=10)
        
        # Assert reasonable performance
        assert len(result) <= 10
    
    def test_compatibility_benchmark(self, benchmark):
        """Benchmark compatibility check."""
        checker = CompatibilityChecker(".")
        
        result = benchmark(
            checker.check_resource,
            "frameworks/pytorch",
            {"python": "3.9.0", "platform": "linux"}
        )
        
        assert result is not None


if __name__ == "__main__":
    """Run the autonomy test directly."""
    print("="*70)
    print("AI HUB AUTONOMY TEST - PROVING EXTERNAL AI CAN USE THIS REPOSITORY")
    print("="*70)
    print()
    print("This test proves that an external AI system can:")
    print("  1. Clone the AI Hub repository")
    print("  2. Initialize semantic search and indexing")
    print("  3. Discover resources through natural language queries")
    print("  4. Check compatibility with target environments")
    print("  5. Discover complete solution stacks")
    print("  6. Plan self-upgrades using repository resources")
    print()
    print("Target: Complete within 5 minutes on standard cloud hardware")
    print("="*70)
    print()
    
    # Create client and run test
    with tempfile.TemporaryDirectory() as temp_dir:
        client = AIAutonomyClient(
            repo_url="https://github.com/welshDog/AI.git",
            local_path=os.path.join(temp_dir, "ai-hub"),
            timeout=300
        )
        
        try:
            result = client.run_full_autonomy_test()
            
            if result["success"]:
                print("\n" + "="*70)
                print("✅ AI AUTONOMY TEST PASSED")
                print("="*70)
                print(f"Total Time: {result['total_time_seconds']:.2f}s")
                print(f"Within 5 Minutes: {result['within_5_minutes']}")
                print(f"Stages Completed: {len(result['stages_completed'])}")
                sys.exit(0)
            else:
                print("\n" + "="*70)
                print("❌ AI AUTONOMY TEST FAILED")
                print("="*70)
                print(f"Error: {result.get('error')}")
                sys.exit(1)
                
        except Exception as e:
            print("\n" + "="*70)
            print("❌ AI AUTONOMY TEST FAILED WITH EXCEPTION")
            print("="*70)
            print(f"Exception: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)