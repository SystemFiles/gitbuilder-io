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
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Authors](#authors)

## 🧐 About <a name = "about"></a>

gitBuilder.io is a simple CLI tool that I believe everyone should have installed on their dev machines. This tool, with it's extensible templates library, allows developers to get up and running very quickly and without all the boring environment and repository setup. gitBuilder.io will start by asking you a couple of basic questions about your project and then will give you a detailed breakdown of how it is building your project the entire way through. After your project is built, you are presented with all the details of your project and the location of your project on Github. At this point, you are ready to start coding! Just like that 🏎💨

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

### Available Options

- reset: `gitbuilder --reset` => Resets any stored auth tokens on your machine so you can re-login or switch accounts

### Required Personal Access Token Permissions

Following principle of least privillage

- repo
- repo:status
- public_repo
- user
- read:user
- user:email
- user:follow

## 🏁 Getting Started with Development <a name = "getting_started"></a>

If you would like to help out by adding your own templates or possibly some new features to the project, you can follow these steps.

### Clone the project

You'll need to close the project to start working on it

```
git clone https://github.com/SystemFiles/gitbuilder-io.git
```

### Prerequisites

First you will need to install a few things if you don't have them already.

```
Node
NPM
```

### Installing

To install project dependencies you need only one command

```
npm install
```

### Adding a Template

Adding a template is super easy. Simply copy the project you want to use as a template into the [templates/projects/](/templates/projects/) folder. Then create a pull request so that we can add your template to the application in the next release!

⚠️ Please make sure your template is working and does not include any inappropriate content. ⚠️

> Supported Languages: Python, NodeJS

### Adding a Feature

Want to see something new in gitBuider.io? Well you can do so easily by cloning the repository

```
git clone https://github.com/SystemFiles/gitbuilder-io.git
```

then make your changes on a branch with the format `feature/feature_name` or `bugfix/name_of_bug_or_issue`

```
git checkout -b feature/feature_name
```

then submit a `pull_request` and I will make sure that your new feature is added.

⚠️ Please note: code changes/feature updates MUST follow the [standard](https://standardjs.com/rules.html) code style guidelines for which this project is following as well as pass all linting/tests in `pull_request` before being merged with `master`. ⚠️

## 🐛 Submitting a bug report / issue
Please use an issue template provided. Create your report [here](https://github.com/SystemFiles/gitbuilder-io/issues)

## ✍️ Authors <a name = "authors"></a>

- [@SystemFiles](https://github.com/systemfiles)
