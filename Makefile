MANIFEST_TEMPLATE := manifest.template.json

VERSION=0.0.0
MONOVA:=$(shell which monova dot 2> /dev/null)

version:
ifdef MONOVA
override VERSION="$(shell monova)"
else
	$(info "Install monova (https://github.com/jsnjack/monova) to calculate version")
endif

generate_manifest: version
	VERSION=${VERSION} envsubst < ${MANIFEST_TEMPLATE} > manifest.json

build: generate_manifest
	node_modules/.bin/web-ext build
