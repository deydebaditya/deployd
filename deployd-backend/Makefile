# Makefile for the deployd-backend service

.PHONY: all test lint fmt compile clean build

all: build

test:
	go test ./...

lint:
	go vet ./...

fmt:
	go fmt ./...

compile:
	go build -o bin/deployd-backend ./cmd

clean:
	rm -rf bin/

build:
	go build -o bin/deployd-backend ./cmd
