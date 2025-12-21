.PHONY: deploy

DOMAIN=barterin.xyz
GITHUB_USERNAME=wahyukodar

# kadang harus github doang tanpa .com ketika memilih SSH config
# user ssh di pc xaurus
SSH_GITHUB_CONFIG_NAME=github.com
# SSH_GITHUB_CONFIG_NAME=github.com-lg -> di laptop

deploy:
	rm -rf build
	yarn build_production
	cd build && git init
	cd build && git remote add origin git@$(SSH_GITHUB_CONFIG_NAME):$(GITHUB_USERNAME)/$(DOMAIN).git
	cd build && git checkout -b gh-pages
	cd build && touch .nojekyll
	cd build && echo '$(DOMAIN)' > CNAME
	cd build && git add .
	cd build && git commit -m "Deploy to GitHub Pages"
	cd build && git push -f origin gh-pages
