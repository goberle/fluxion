FILE = main
NAME = Fluxions
PDFLATEX = mkdir -p .tmp && cd src && pdflatex --output-directory ../.tmp ../src/${FILE}.tex && mv ../.tmp/${FILE}.pdf ../${NAME}.pdf && cd ..
BIBER = mkdir -p .tmp && cd .tmp && biber ${FILE} && cd ..
.PHONY: all, biblio, _main, _bib

all: pdf bib open

bib: _bib _post

pdf: _pre

clean:
	rm -rf .tmp

open:
	open ${NAME}.pdf

_pre:
	${PDFLATEX}

_bib:
	${BIBER}

_post:
	${PDFLATEX}