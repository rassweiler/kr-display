# Windows

## Setup
- Install [Meteor](https://www.meteor.com/install).
- Clone [KR-Display](https://github.com/rassweiler/kr-display) to server or development machine.
- Open a cmd.exe window at the root.
- Type ```meteor``` and press enter.
- Let Meteor download the packages.
- The cmd window will throw an error that settings is undefined.
- Close the cmd window.

## Development
- Create settings.json in project root with required settings, see [Settings Documentation](Settings.md).
- If you make your settings file elsewhere you will need to modify Start-Dev.bat or use the cmd line to run:
```
meteor --settings "Path/To/Settings/File.json"
```
- Run Start-Dev.bat.
- Begin modifying the application.

## Deployment
