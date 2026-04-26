# Contributing to AI Hub

Thank you for your interest in contributing to AI Hub! This document provides guidelines and instructions for contributing to make the process smooth and effective.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Resource Submission Guidelines](#resource-submission-guidelines)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Documentation](#documentation)
- [Review Process](#review-process)
- [Governance](#governance)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment**
4. **Create a branch** for your contribution

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/AI.git
cd AI
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check if the bug has already been reported
- Try to isolate the problem
- Collect information about the issue

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Relevant logs

### Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and describe:
- The problem you're trying to solve
- Your proposed solution
- Alternative solutions considered
- Use cases

### Submitting Resources

See the [Resource Submission Guidelines](#resource-submission-guidelines) below.

### Code Contributions

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Add/update tests
4. Update documentation
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Resource Submission Guidelines

### Directory Structure

Place resources in the appropriate category directory:

```
AI/
├── frameworks/     # AI frameworks and libraries
├── datasets/       # Curated datasets
├── models/         # Pre-trained models
├── tutorials/      # Educational content
├── benchmarks/     # Evaluation suites
└── tools/          # Utility scripts
```

### Required Files

Each resource must include:

1. **metadata.json** - Standardized metadata following our schema
2. **README.md** - Resource-specific documentation
3. **LICENSE** or license reference
4. **Installation instructions**
5. **Usage examples**

### Metadata Requirements

Create a `metadata.json` file:

```json
{
  "name": "your-resource",
  "version": "1.0.0",
  "type": "model",
  "description": "A comprehensive description (minimum 50 characters)...",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "license": "MIT",
  "compatibility": {
    "python": ">=3.8",
    "platforms": ["linux", "darwin", "win32"]
  },
  "tags": ["nlp", "pytorch", "transformer"],
  "installation": {
    "pip": "pip install your-resource"
  },
  "ai_discoverability": {
    "task_types": ["classification"],
    "input_modalities": ["text"],
    "output_modalities": ["probability"]
  }
}
```

### Validation

Validate your metadata before submitting:

```bash
python -c "from ai_hub.metadata import MetadataValidator; \
  v = MetadataValidator(); \
  v.create_template_file('model', 'your-resource/metadata.json')"
```

Or use the validation script:

```bash
python scripts/validate_metadata.py your-resource/metadata.json
```

## Development Setup

### Prerequisites

- Python 3.8+
- Git
- Node.js 18+ (for dashboard development)

### Installation

```bash
# Clone repository
git clone https://github.com/welshDog/AI.git
cd AI

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install
```

### Project Structure

```
AI/
├── ai_hub/           # Core Python package
│   ├── __init__.py
│   ├── search.py     # Semantic search
│   ├── metadata.py   # Metadata management
│   ├── compatibility.py
│   └── autonomy.py
├── tests/            # Test suites
├── scripts/          # Automation scripts
├── config/           # Configuration files
└── dashboard/        # Metrics dashboard
```

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_ai_autonomy.py

# Run with coverage
pytest --cov=ai_hub --cov-report=html

# Run benchmarks
pytest tests/benchmarks/ --benchmark-only
```

### Writing Tests

- Place unit tests in `tests/unit/`
- Place integration tests in `tests/integration/`
- Place benchmarks in `tests/benchmarks/`
- Use descriptive test names
- Include docstrings explaining what is being tested

Example:

```python
def test_semantic_search_finds_relevant_resources():
    """Test that semantic search returns relevant results for queries."""
    search = SemanticSearch()
    results = search.find("transformer model", limit=5)
    assert len(results) > 0
    assert all("transformer" in r.description.lower() for r in results)
```

## Documentation

### Building Documentation

```bash
# Install docs dependencies
pip install mkdocs mkdocs-material

# Serve locally
mkdocs serve

# Build
mkdocs build
```

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep READMEs up to date
- Document all public APIs
- Use type hints in Python code

## Review Process

### Pull Request Workflow

1. **Create PR** using the template
2. **Automated checks** run (CI/CD)
3. **Code review** by maintainers
4. **Address feedback**
5. **Approval and merge**

### Review Criteria

- Code quality and style
- Test coverage
- Documentation completeness
- Metadata validity (for resources)
- Backwards compatibility
- Performance impact

### Response Time

- Initial review: 2-3 business days
- Follow-up reviews: 1-2 business days
- Urgent fixes: Same day

## Governance

### Decision Making

- **Minor changes**: Single maintainer approval
- **Major changes**: Consensus among core team
- **Breaking changes**: Community discussion required

### Conflict Resolution

1. Discuss in PR/issue comments
2. Escalate to code owners if needed
3. Final decision by project lead

### Security

Report security vulnerabilities to [security@aihub.dev](mailto:security@aihub.dev). Do not open public issues for security problems.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

## Questions?

- Join [GitHub Discussions](https://github.com/welshDog/AI/discussions)
- Open an issue with the "question" label
- Contact maintainers: [maintainers@aihub.dev](mailto:maintainers@aihub.dev)

---

Thank you for contributing to AI Hub! Together, we're building the world's most comprehensive AI resource repository.