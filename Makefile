
mocha = ./node_modules/.bin/mocha

test:
	@$(mocha) \
		--require assert \
		--reporter spec \
		--bail

example:
	cd  examples/string/ && component install && cd -
	node examples/string/builder
	open examples/string/index.html

	cd  examples/template/ && component install && cd -
	node examples/template/builder
	open examples/template/index.html

.PHONY: test example
