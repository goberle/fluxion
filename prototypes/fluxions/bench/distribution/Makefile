FILE = main
NAME = distribution
COMPILE = node index.js
PDFLATEX = mkdir -p .tmp && cd src && pdflatex -shell-escape --output-directory ../.tmp ../src/${FILE}.tex && mv ../.tmp/${FILE}.pdf ../${NAME}.pdf && cd ..
BIBER = mkdir -p .tmp && cd .tmp && biber ${FILE} && cd ..
.PHONY: all, bib, _main, _bib, _comp

all: comp pdf open

bib: _bib _post

pdf: _pre

comp: _comp

clean:
	rm -rf .tmp; rm -rf src/main-figure*

open:
	open ${NAME}.pdf

_comp:
	${COMPILE}

_pre:
	${PDFLATEX}

_bib:
	${BIBER}

_post:
	${PDFLATEX}