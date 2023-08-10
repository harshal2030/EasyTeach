# EasyTeach

<img src="https://raw.githubusercontent.com/harshal2030/EasyTeach/master/shared/images/logo.png" height="200" />

EasyTeach is a comprehensive educational tool designed to make teaching and learning easier and more interactive. It offers secure test and automatic report generation, plus end to end user tracking

# Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)

# Features

- **Interactive Lessons**: Create dynamic lessons with multimedia content with end to end tracking
- **Assessment Tools**: Quizzes, tests, and feedback for students with automated reports.
- **Collaborative Learning**: Collaborate in real-time with other users.

# Installation

This process assumes that you have node v14.17.x installed on your system.

1. Clone the repo.
```git clone https://github.com/harshal2030/EasyTeach.git```
2. Navigate to the directory

```
cd EasyTeach
```
3. Install the dependencies
```
$ yarn
$ pnx patch-package
```
4. Setup Environment variables in file `.end.development` for running locally on your machine and `.env.production` for building it for production
```
env=<production or development>
accPass=<should be same as backend>
key_id=<provided by razorpay>
MYAPP_UPLOAD_STORE_FILE=<name of the keystore file for signing app>
MYAPP_UPLOAD_STORE_PASSWORD=<password provided for keystore>
MYAPP_UPLOAD_KEY_ALIAS=<alias provided for keystore>
MYAPP_UPLOAD_KEY_PASSWORD=<password provided for keystore>
```
For more on app signing head to https://reactnative.dev/docs/signed-apk-android

5. Run `yarn android` or `yarn ios` for mobile version and `yarn web` for the web version

# Usage
- Register or log in to your account.
- Navigate through the dashboard and create or join a class.
- Collaborate, teach, and learn
