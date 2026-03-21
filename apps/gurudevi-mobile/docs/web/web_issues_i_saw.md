this doc is to list issues in web i saw when manual testing.


## 13/03/2026 (latest - [n])

###  2.45 pm
1. add info icon and when clicked it should show modal with info about that feature and where to find it in app. (neeed to test for self section)
2. in community scetion there are 3 main parts and 4 cumulative sub parts. feed, groups, dms are 3 main parts and in groups there are 2 parts where joined groups vs global groups. so that how things are. then i think we need to groups tab to align with two types and i think whats there now seems not aligh with that. we need UI and wiring and everything. including showing global groups to everyone should be functional. currently, in small screens it shows upper bar instead of sid list of thing but upper bar only as three things
3. lots of Missing translations. 
4. self ui should be more human, organic, soulful - now its its not good its bad i dont know why. something is there.  may be texture of UI which feels like grainy or rough i dont know. may be emoji varient is ugly i dont know something is out of alignment. may be something is missing or something is not there. layout may be fine. 
5. in profile scetion - social links parts lets make inline editable than open in new modal again. we can show icons of different social medias and then let edit the contact. may be need validation or confirmation of ownership of they very contact?. privacy(visible to whom?) thing may be using emojies such as eye to visibility globe for public and lock for private and two people for only frineds. think as UX stragist and best user experience.(need to check mobile as wel) 
6. need to implement and if implemented then need to check whether its working the social profile thing when someone tap on the avatar or profile icon in community section.
7. school, classroom, community creation modal should be isomorphic and accurate against real world info, details in context of sri lanka, and need to validate and make it accurate fo user inputs. and it should be flowing one step by step than being confusing. (this should be same for mobile too.[need to implement in upstream so usable for both platforms])
8. after creating school/classroom/community it should be visible in the list of schools/classrooms/communities in the app. and user should be accurately use it. 

## 09/03/2026 (latest [n])

### 2.00 pm
1. https://platform.gurudevi.edlove.org/?error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user#error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user&sb= (seems okay)
2. explore as guest not wroking - seems we had some plans but didnt continued in other hand we changed identityapi and users recently.
3. loading shimmers are very small and ugly not aligned with screen size(in large screens where shimmers are too small). i think may be issues is we are using mobile native shimmers in web which  can't match web screen sizes? then what?
4. lazy loading seems making everything slow. is that a issue or only because local build? (why lazy loading over other way - justify)
5. in smaller desktop screens(responsiveness) when bottom bar is appeared and side bar become hamberger. when opening the hamberger menu it clashes with bottom bar. so it need to close the bottom bar when opening the hamberger menu.
6. the dot icon on notification bell s is still there in side bar though when no notifications. though tried still same.
7. icons are not aligned in the collapsed side bar specially setting icon in below. seems setting icon is has s\different padding etc. 
8. in sidebar, there is text as naviagte, lets rename it as Menu and lets bring the collapsing icon to right side to the label where its in left side.. seems okay this.
9. the name and top most part of self screen is different from other sections(which has specific font etc), we need to keep the UI standard b making self section aligned with other pages(for everyone). done 
10. wire all features in functional way with db saving all things in temporal manner
11. ai and ocr features, library and maps
12. community groups
13. demo classroom for even guest, newly authed based on view
14. easily accessible breathing guides
15. info or guidance for each feature and where to put them???




## 08/03/2026 (latest [n-1])

### 4.00 pm
1. what is the mechanism to handle this? both mobile and web. need to show user to say in {email} already have an accout and please login while user shiuld directed to auth -> login page. https://platform.gurudevi.edlove.org/?error=server_error&error_code=identity_already_exists&error_description=Identity+is+already+linked#error=server_error&error_code=identity_already_exists&error_description=Identity+is+already+linked&sb=




## 07/03/2026 (previous [n-2])

### 11.00 pm
1. remove founder, developer admin rolew from onboarding journey screens in both web (done)
2. make onboarding screens web first in web version now its mobile-streched 
3. make welcome screen web in proper layout an responsive where now its jumble mumble upon in ugly way for small small in desktop, and mobile screens (may be add containers for things or proper layout)
4. Make web pages indexed where navigatable through deep links. now it throws 404. if any user comes directly into web without exisitng session transfer user into web main screen. previously this has implemented but need recheck. 
5. all sections/tabs in web for all roles(principal, teacher, student),  should be functional using what offered and capable in mobile. i think we did lot of implemntations but still old web screens are there.
6. add sociallink(linktree?) functionalities in to profile section in web similar to mobile fullprofileview and integrated anything missed. 
7. Filtering and sorting functionalities for library 
8. searching should be functional in all library, community and classrooms. any click/tap on anything should do the job.
9. Better UI deisgn/ layout for library??
10. self, classroom and community sections seems not 100% functional yet
11. test dark vs light theme and other settings
12. sin,tamil, english support
13. Edit profile view should also appera within shell(top,side bar while it should be closable)
14. In profilesection integrate publicsocialprofile or something under the id card. then under that add the edit profile thing. horizontally next to the id card add QR code section to  then its two column. only id and QR are two columns.
15. i selected lang as ta in welcome screen but in settings no tamil lang option and still shows as enlish so seetings should be synced and dynamic in every screen
16. mobile vs web parity. now i see nothing in web works. what i need is in simpler terms web should have all features in role*section*screen*features and only difference should be is layout, UI visuals. how is the gap now??


###  3.35 pm
1. Notification and setting details should open within topbar+sidebar shell. no in new window (done)

2. profile section is fucking messy and usgly. need to first see what are inlcuing in fullprofileview in mobile, then growth modal and rewards and then organize web UI arrouding to componets yet layout should be Web first (done)

3. self,classroom, library sections should be developed comparatively to mobile and UI should feel standalone web. in everysection nothing can be there not wired correctly or not dynamically functional. which menas no hardcided and no demos etc. 
