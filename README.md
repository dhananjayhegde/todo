# todo
In-Browser TODO app with Javascript and jQuery

# Intention

Intention is to create a simple-to-use TODO app that
- Can run on browser wihtout the need of internet connection
- Has zero or least set up
- Has no module installation, least dependency
- Needs no server or backend
- Can still be able to persist data (in browser) using WebSQL

So, the 'stack' is merely Javascript.

# Demo

Overall app looks like this:

![image](https://user-images.githubusercontent.com/11610999/44067734-883c0b9e-9f94-11e8-9419-89af8389d6ae.png)

This is devided mainly into 3 sections:
- Left : Information section
- Center: Add new task and listing of tasks
- Right: Action buttons

Adding a new task is as easy as typing into the text field and pressing Enter key

![image](https://user-images.githubusercontent.com/11610999/44067819-e56798f6-9f94-11e8-8209-e3064c24076d.png)

Tasks as properly highlighted by priorities ( High, Medium and Low):

![image](https://user-images.githubusercontent.com/11610999/44067918-5a929504-9f95-11e8-90c6-8845833dee6b.png)

Tasks can be selected individually and be acted upon:

![image](https://user-images.githubusercontent.com/11610999/44067849-0b85dbe2-9f95-11e8-8fe1-8d1c87b323df.png)

Action buttons are placed on the right section for this purpose:

![image](https://user-images.githubusercontent.com/11610999/44067942-714c2dc8-9f95-11e8-8f5e-49bec7d32133.png)

# (web) Technology stack (if it can be called that)!
- Javascript, jQuery (3.1.1)
- Custom Components with Shadow DOM (No Polymer etc.)
- WebSQL for data persistence in-browser

# NOTE
App is tested only on Google Chrome (Custom components did not seem to work on Edge)


# Project Structure
If you want to contribute (you are most welcome), project is divided into below sections:

- index.html (basic barebones of the page)
- js folder
   - app.js ( magic happens here - divided into 3 namespaces viz. model, view, controller
   - database.js ( WebSQL related code resides here - almost all methods return a Promise so app.js can rely on them (pun intended ;-) ))
   - todo-item.js ( custom element to display a task - styles for the tasks are here)
- css
    - styles.css (all remaining styles are here)
    
 So far, no Bootstrap or other UI frameworks to keep the project lightweight and simple
