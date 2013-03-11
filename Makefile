build: 
	stylus -c --include client/stylesheets --include node_modules/nib/lib --compress --out client/stylesheets client/stylesheets/style.styl
	
compile:
	stylus --include client/stylesheets --include node_modules/nib/lib --out client/stylesheets client/stylesheets/style.styl
	# node node_modules/requirejs-preprocessor/main.js --compile

watch: 
	make -j stylus

start:
	node server/app.js

stylus:
	stylus -c --include client/stylesheets --include node_modules/nib/lib --out client/stylesheets --watch client/stylesheets/style.styl

.PHONY: build watch compile
.SILENT: beobachten
