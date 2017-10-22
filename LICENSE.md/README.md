# Swim App
An application created with Adobe PhoneGap to allow swim coaches to record and
automatically score race results for swim meets. This application has only
been tested with iOS but it should be compatible with Android as PhoneGap
is used to build for multiple platforms.

Created by: [Bobby Villaluz](https://github.com/bobbyvillaluz) and [Andrew Schembor](https://github.com/schembora)

![](https://i.imgur.com/y9QBPlH.jpg)

# Build the App

Here's an [introduction to PhoneGap](http://docs.phonegap.com/getting-started/), the framework used to create this application.

Follow [this tutorial](http://docs.phonegap.com/references/desktop-app/open-project/) to import the project into PhoneGap.
If that procedure fails, try to create a new PhoneGap project and replace the
new project files with the Swim App files.

After importing the project you can [preview the app](http://docs.phonegap.com/getting-started/4-preview-your-app/desktop/) to test its features and interface design.

Once you have made any desired customizations to the app (or if you're satisfied
with the default), you can [build the application](http://docs.phonegap.com/getting-started/5-going-further/) either locally using PhoneGap CLI
or PhoneGap Build.

# Files
Most files are located in the "www" folder.

"www/js/app.js" contains the main functionalities.

"www/index.html" is the creation page for a swim meet.

"www/modify.html" is used to modify the results of a race.

"www/results.html" displays the race that is being recorded or modified.

# Customizations

"Home" is the term used to indicate your team. In order to change this you must
modify "www/js/app.js". On the initial setup page you will be prompted for the
name of the other team.

The app icon is "www/icon.png". An example/placeholder currently exists.

The splash screen files (images displayed during the app's startup) are located
in "www/splash.png" and "www/splash". Example files currently exist.
