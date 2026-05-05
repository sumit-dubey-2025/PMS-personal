# This file intentionally contains no executable fix-up logic.
# The previous implementation used a machine-specific absolute path and
# performed an ad-hoc regex rewrite against a source file, which is not
# reproducible for other developers or CI.
throw "Disabled one-off local source rewrite script. Remove this file from active use or replace it with documented, maintainable tooling that uses repository-relative paths."
