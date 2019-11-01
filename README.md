# MeetingPlanner

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.9.

Project Description – meetingplanner.xyz

Titus vimal raj | titusvimalraj@gmail.com| 8610265950

Requirement

The requirement of this project was to create a web application ready to deploy meetings scheduling system and its features. The project was also supposed to be hosted in AWS cloud with Nginx.

Technologies used:

Frontend Technologies - HTML5, CSS3, JS, Bootstrap and Angular 7

Backend Technologies - NodeJS, ExpressJS and Socket.IO

Database – MongoDB

Notable npm packages: nodemailer, angular-calendar 6+

Hosting: AWS (EC2, S3, Route 53)

Application features

	The application has the following features listed below in points:
  
•	There are two user type Admin and user, the Admin is able to add, edit and delete meetings in the schedule while the user can only view them.

•	Every meeting has a modal view for viewing and editing. The editing view is only accessible for the Admin user type.

•	The Application work on a real time update hence there are meetings generated at once.

•	There are notifications sent for add, edit and delete action on meetings by admin to the user in real time as well as through email.

•	The admin can send reminder emails to the users associated with the meetings the admin had created.

•	All type of users gets an alert 1 minute before meeting, with an option to snooze or dismiss. If snoozed, alert comes again in 5 seconds, if snoozed again, it re-appears in next 5 seconds and so on. Once dismissed, alert no longer appears.

•	Users also get an alert once the meeting has started.

•	Users can view their profile in the profile tab.

•	There are three views for the calendar within the dashboard namely month view, week view and day view.

•	The password reset sends a link through nodemailer to user’s email.

Additional features:

This project was decided to be made fully responsive hence the design was made with mobile first approach concept. 
The website is fully responsive at mobile resolutions as well; also there is good UX designed progress bar, login form and sign up form elements.
The application is made to work on real time using socket.io and hence the views for various contents got into a single one in a dashboard. 
Even though Angular calendar doesn’t support mobile version, in this project with customisations it has been made mobile friendly.


Assumptions:

1.	The user logs into the application with one instance at once or else the earlier version of the client session is timeout.


Instructions:

The uri for front end is www.meetingplanner.xyz

The uri for back end is api.meetingplanner.xyz 

The uri for API documentation is apidoc.meetingplanner.xyz 

The uri for Socket events documentation is eventdoc.meetingplanner.xyz


The secret key has to be stored in database hence it remains to the host admin to create a key value pair in the database as db.globalconfigs.insertOne({secretKey:”theSceretKeyYouLike”})
Refer documentations of Aws for credentials setup and also mongodb for database actions, socket.io documentation for events, nodemailer documentation for setting up with gmail.

Git hub repositories

Frontend: https://github.com/Titusvimalraj/meeting-planner-frontEnd.git

Backend: https://github.com/Titusvimalraj/meeting-planner-backend.git

Acknowledgement:

Sincere thanks to Mr. Aditya Kumar (CTO, ediwsor.com) and edwisor for providing a very good content for learning. Thanks to edwisor for providing the problem statement and also thanks to development communities out there stackoverflow, redit, github who help in understanding queries raised at instant without them this wouldn’t have been possible.

Note: some of the code for authentication and socket have been utilized from the learning content at edwisor.

Also the background image is owned by shutter stock and it is utilised solely for individual and learning purpose not for any commercial reason.

