
examples:
	cd examples/string && component install && cd -
	node examples/string/builder
	open examples/string/index.html
	cd examples/template && component install && cd -
	node examples/template/builder
	open examples/template/index.html

test:
	@./node_modules/.bin/mocha --reporter spec --bail

.PHONY: test examples
