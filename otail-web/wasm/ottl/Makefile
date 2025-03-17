.PHONY: build clean

# Output directory for wasm files
OUT_DIR=../../public/wasm

# Ensure the output directory exists
$(OUT_DIR):
	mkdir -p $(OUT_DIR)

# Build the wasm binary
build: $(OUT_DIR)
	GOOS=js GOARCH=wasm go build -o $(OUT_DIR)/ottl.wasm
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" $(OUT_DIR)/

# Clean build artifacts
clean:
	rm -rf $(OUT_DIR)/ottl.wasm
	rm -rf $(OUT_DIR)/wasm_exec.js
