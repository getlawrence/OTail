.PHONY: build clean

# Output directory for wasm files
OUT_DIR=../../public/wasm

# Ensure the output directory exists
$(OUT_DIR):
	mkdir -p $(OUT_DIR)

# Build the wasm binary
build: $(OUT_DIR)
	GOOS=js GOARCH=wasm go build -o $(OUT_DIR)/ottl.wasm
	# Try to find wasm_exec.js in different possible locations
	@if [ -f "$(shell go env GOROOT)/lib/wasm/wasm_exec.js" ]; then \
		cp "$(shell go env GOROOT)/lib/wasm/wasm_exec.js" $(OUT_DIR)/; \
	elif [ -f "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" ]; then \
		cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" $(OUT_DIR)/; \
	else \
		echo "Warning: wasm_exec.js not found in expected locations"; \
		echo "GOROOT: $(shell go env GOROOT)"; \
		find "$(shell go env GOROOT)" -name "wasm_exec.js" 2>/dev/null | head -1 | xargs -I {} cp {} $(OUT_DIR)/ || echo "Failed to find wasm_exec.js"; \
	fi

# Clean build artifacts
clean:
	rm -rf $(OUT_DIR)/ottl.wasm
	rm -rf $(OUT_DIR)/wasm_exec.js
