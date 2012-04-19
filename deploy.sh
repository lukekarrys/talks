#!/bin/sh

rsync -avze 'ssh -p 22' --delete public/ linode:www/talks.lukecod.es/public_html/
