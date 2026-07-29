.PHONY: dev build-windows build-linux

dev:
	cd desktop && wails dev -tags webkit2_41

build-windows:
	cd desktop && wails build -platform windows/amd64

build-linux:
	cd desktop && wails build -platform linux/amd64 -tags webkit2_41
