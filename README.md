<p align="center">
  <a href="" rel="noopener">
 <img width=376px height=265px src="https://i.imgur.com/oL6UMJl.png" alt="gitBuilder Logo"></a>
</p>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Code-Style](https://img.shields.io/badge/style-standard-green.svg)](https://standardjs.com/rules.html)
[![GitHub Issues](https://img.shields.io/github/issues/systemfiles/gitbuilder-io.svg)](https://github.com/SystemFiles/gitbuilder-io/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/systemfiles/gitbuilder-io.svg)](https://github.com/SystemFiles/gitbuilder-io/pulls)
[![Building](https://travis-ci.com/SystemFiles/gitbuilder-io.svg?token=6Y7YdX9nje6DsLwKzn5D&branch=master)](https://travis-ci.com/github/SystemFiles/gitbuilder-io)
[![Downloads](https://img.shields.io/npm/dm/gitbuilder-io.svg)](https://www.npmjs.com/package/gitbuilder-io)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> A simple, easy-to-use Git project builder (ONLY supports GitHub currently)
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Changelog](/CHANGELOG.md)
- [API](#api)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Authors](#authors)

## 🧐 About <a name = "about"></a>

GitBuilder.io is a simple CLI tool (project wizard) that helps you bootstrap your projects quickly and easily. This tool, with it's extensible templates library, allows developers to get up and running very quickly and without all the boring environment and repository setup. gitBuilder.io will start by asking you a couple of basic questions about your project and then will give you a detailed breakdown of how it is building your project the entire way through. After your project is built, you are presented with all the details of your project and the location of your project on Github. At this point, you are ready to start coding! Just like that 🏎💨

## 🗒 Changelog <a name = "changelog"></a>

Please take a look at the current changes and progress on the [Changelog](/CHANGELOG.md)

## 🎈 Usage <a name="usage"></a>

If you would like to download this tool for your own use, you may to so by downloading the package globally from NPM

```
npm install -g gitbuilder
```

Start the tool

```
gitbuilder [options]
```

Select a login method

```
Basic Login
OR
OAuth Token
```

Login and follow the simple prompts to build your project! 🙂🥂

### Available Command-line Options

- reset: `gitbuilder --reset` => Resets any auth tokens, saved settings, and templates stored on your machine so you can start from scratch.

- add_template: `gitbuilder --add_template/-A` => Will allow you to add a template to our list of built-in templates using a valid OAuth API Token. **Required** -> Zip MUST contain only the template project contents and not a folder containing project contents. (PLANNED)

### Required Personal Access Token Permissions

Following principle of least privillage

- repo
- repo:status
- public_repo
- user
- read:user
- user:email
- user:follow

## 📶 Using the templates API <a name = "api"></a>

We have a simple API for sending and retrieving git project templates from a cloud hosted blob storage.

### Uploading a template

```bash
curl --location --request POST 'https://gb.sykesdev.ca/api/template?lang=<LANGUAGE>' \
--header 'Authorization: Bearer <YOUR_API_TOKEN>' \
--form 'files=@path/to/project/template/template.zip'
```

### Get list of available templates

```bash
curl --location --request GET 'https://gb.sykesdev.ca/api/template?lang=<LANGUAGE>'
```

### Get template filestream

```bash
curl --location --request GET 'https://gb.sykesdev.ca/api/template?name=<TEMPLATE_NAME>&lang=<LANGUAGE>'
```

## 🏁 Getting Started with Development <a name = "getting_started"></a>

If you would like to help out by adding your own templates or possibly some new features to the project, you can follow these steps.

### Clone the project

You'll need to fork the project to start working on it

### Prerequisites

First you will need to install a few things if you don't have them already.

```
Node
NPM
```

### Installing

Install dependencies using NPM

```
npm install
```

### Adding a Template

There is a new way to add templates now. If you are a project contributor/administrator you can use the template API to add a new **built-in** template to the project (may have to request an OAuth token to be generated for you). If you are a user of the application, you can add templates to your own instance of gitbuilder by creating a public GitHub project for your template or finding one on GitHub, then simply select `add external` when creating a new project and supply the URL to the project and it will be used for your project and added to a list for future use.

To use the API make a POST request to the `https://gb.sykesdev.ca/api/template` endpoint

```bash
curl --location --request POST 'https://gb.sykesdev.ca/api/template?lang=<LANGUAGE>' \
--header 'Authorization: Bearer <YOUR_API_TOKEN>' \
--form 'files=@path/to/project/template/template.zip'
```

> Supported Languages: Python, NodeJS + More in near future

### Adding a Feature

Want to see something new in gitBuider.io? Well you can do so easily by forking the project. Then clone to your local workspace.

```bash
git clone https://github.com/YOU/gitbuilder-io.git
```

then make your changes on a branch with the format `feature/feature_name` or `bugfix/name_of_bug_or_issue`

```bash
git checkout -b feature/feature_name
```

then submit a `pull_request` and I will make sure that your new feature is reviewed / added.

⚠️ Please note: code changes/feature updates MUST follow the [standard](https://standardjs.com/rules.html) code style guidelines for which this project is following as well as pass all linting/tests in `pull_request` before being merged with `master`. ⚠️

## 🐛 Submitting a bug report / issue
Please use an issue template provided. Create your report [here](https://github.com/SystemFiles/gitbuilder-io/issues)

## ✍️ Authors <a name = "authors"></a>

- [@SystemFiles](https://github.com/systemfiles)
