NODE_PATH ?= ./node_modules
JS_TESTER = $(NODE_PATH)/vows/bin/vows

run-tests: test/*
	@$(JS_TESTER)

