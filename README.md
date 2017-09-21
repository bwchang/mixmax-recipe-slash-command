# Edamam Recipe Slash Command for Mixmax

This is an open source Mixmax Slash Command.

## Running locally

1. Install using `npm install`
2. Run using `npm start`
3. Restart chrome using the command `open -a Google\ Chrome --args --ignore-certificate-errors` to temporarily disable SSL certificate errors.
4. Open up the Mixmax Developer Dashboard and click Add Slash Command.
5. Add command accordingly, using the following parameters: 
```
Name: Edamam Recipe Search
Command: recipe
Parameter placeholder: [Search]
Typeahead API URL: https://localhost:9145/typeahead
Resolver API URL: https://localhost:9145/resolver
```
6. Refresh Gmail with Mixmax installed.
7. Compose an email and enter `/recipe` to search for recipes.
