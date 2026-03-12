
_________________________________



git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/snopitech/Bank.git
git push -u origin main

git remote add origin https://github.com/snopitech/Bank.git
git branch -M main
git push -u origin main


After working on code please push to Git by
git add .  (to add all new changes to  the list of push)
git commit -m " message " (to prepare all new changes for push)
git push  (to push your code to GitHub)
___________________________________________________
How to clone
go to git bash, cd to the folder where you want to clone
you code to,
Then type git clone "your repo url"


_______________________________________________________
When you have java, node.js and react already installed,
just clone your code work on it,
start up react at
npm install vite --save-dev
Get-Content package.json
dir node_modules\.bin\vite*
node_modules\.bin\vite
_____________________________

The ports for my frontend
http://localhost:5173/  for the Admin-panel
http://localhost:5174/  For the hr-dashboard
http://localhost:5175/  For the customer-frontend
_____________________________________


terminal important commands
cd ..  (to go one step backward) cls (to clear content) cd folder-name (to go the folder)
Ctrl + Shift + P (type Close All Editors to close tabs in vscode)
____________________________________

To create A frontend with react + vite

first of all go to terminal in vscode and install node.js  node -v and check if it is installed, npm -v
Then create your vite + react project
npm create vite@latest .

select react and javascript.
It is thesame way you select angular and typescript.
use vit 8  no
npm install  (install npm to start)
copy the url and paste on the browser,

Makesure you install npm install @heroicons/react
             **npm audit fix**

Makesure you install npm install react-router-dom
Now install vite to get tailwind
npm install -D tailwindcss postcss autoprefixer

this will give you headache but work with copilot ai
npm install react-router-dom (install router)

To find some thing, press ctrl +shift + F and type what you want.

note,
Running the frontend, react + vite
cd C:\Users\snoop\Desktop\SnopitechBank\frontend
Press Ctrl + C to stop the server
npm run dev  (to start server and paste the url on a browser)
________________________________________

Running the backend, spring boot
cd C:\Users\snoop\Desktop\SnopitechBank\backend
Press Ctrl + C to stop the server
./mvnw spring-boot:run  (works for me)


If error occurs, it could be that the server is already running and you nee to stop it first
netstat -ano | findstr :8080  (to stop springboot run)
copy the code and replace it for
taskkill /PID  25188 /F
then run again ( ./mvnw spring-boot:run )
___________________________________

MySQL Queries

SHOW DATABASES;
USE snopitechbank;
SELECT * FROM users;
SELECT * FROM accounts;
take the MySQL off safe mode
Delete all accounts
Resetting database

SET FOREIGN_KEY_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 1;
ALTER TABLE accounts AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
DELETE FROM accounts;
DELETE FROM users;

____________________________________

-- First, disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;
____________________________________
-- Clear all tables in correct order
TRUNCATE TABLE alerts;
TRUNCATE TABLE accounts;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
_______________________________
_______________________________

SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM accounts;
SELECT COUNT(*) FROM alerts;

____________________________________

SELECT id, card_number, account_id, status FROM cards; (to see debitcard in the database)
____________________________________

For my AI features, I added Ollama for advance queries

i went to gitbash to download windget install Ollama.Ollama
The go to cmd as admin and check
the version. ollama --version
             ollama pull gemma:2b
             ollama run gemma:2b "Hello! What is 2+2?"
             curl http://localhost:11434/api/version
go to termininal in vscode, type ls
                                 Test-Path AI  (if false)
                                 New-Item -ItemType Directory -Name AI  (it will be true now if you type Test-Path AI again)
                                 check ls again you will see AI in the folder
then run the command one by one cd AI
                                 pwd
                                 ls
                                 New-Item -ItemType File -Name AIMainAnalyzer.js 
                                  # 5. Verify file exists  ls
                                  # 6. Go back to main folder cd ..
                                  # 7. Final check  ls
so everytime before you start you web, start the springboot for the backend services ( ./mvnw spring-boot:run ) and
for the frontend start  by typing:  curl http://localhost:11434/api/version
                            select :  Y
                            and    : npm run dev
What you gain:

    Simple questions → Still fast from your system
    Complex questions → Now get AI-powered insights
    Fallback → If Ollama fails, your system still works
    Privacy → Ollama runs locally on your machine
__________________________________________________________________________

To Run your backend queries from Thunder client or Postman in your vscode
__________________________________________________________________________

APIs for customer-frontend

GET       http://localhost:8080/api/users/{id}/transactions (to show all transaction history of individual user account)(this should go in the description history of the dashboard.)
GET       http://localhost:8080/api/transactions/filter
(does similar functions as GET http://localhost:8080/api/transactions )
GET       http://localhost:8080/api/transactions/filter?sort=asc
GET       http://localhost:8080/api/transactions/filter?type=TRANSFER&sort=desc
GET       http://localhost:8080/api/transactions/filter?type=DEPOSIT&minAmount=100&sort=asc
GET       http://localhost:8080/api/transactions/filter?minAmount=50&maxAmount=200
GET       http://localhost:8080/api/transactions/filter?startDate=2026-01-29T00:00:00&endDate=2026-01-29T23:59:59
GET       http://localhost:8080/api/transactions/filter?type=TRANSFER
GET       http://localhost:8080/api/transactions/filter?sort=desc
GET       http://localhost:8080/api/header/stats
GET       http://localhost:8080/api/users  (gives you the entire details of the users in the database)
GET       http://localhost:8080/api/users/{id} (gives you the entire details of the user)
GET       http://localhost:8080/api/accounts/{id}/statements?year=2026&month=12 (gives you the statement of accounts)
GET       http://localhost:8080/api/transactions (to show all transaction history) (not necessary)
POST      http://localhost:8080/auth/register (To create accounts for user)
PUT       http://localhost:8080/api/users/1/update-profile  (to update the profile of user)
PUT       http://localhost:8080/api/users/1/security-questions (to add security question to user during registration)
____________________________________________________________________________________

Password reset

POST      http://localhost:8080/auth/forgot-password with email (To send the email link)
GET       http://localhost:8080/auth/verify-reset-token/YOUR-TOKEN-HERE( to test token verification)
POST      http://localhost:8080/auth/reset-password (Now to change the password use the same token)
_________________________________________________________________________________________
POST      http://localhost:8080/auth/change-email/request (to request email change token
POST      http://localhost:8080/auth/confirm-email-change
PUT       http://localhost:8080/api/users/{id}/update-profile-safe (to update profile and save them)

PUT        http://localhost:8080/api/users/17/update-profile-safe

GET       http://localhost:8080/api/inquiries/reference/{id} (Get inquiry by reference number)
GET       http://localhost:8080/api/inquiries/status/{id}    ( Check inquiry status)
GET       http://localhost:8080/api/inquiries/my-inquiries   ( Get user's inquiry history)
GET       http://localhost:8080/api/inquiries/stats           (Get statistics for dashboard)
POST      http://localhost:8080/api/inquiries/public           (allow to Submit inquiry note non-logged-in users)
POST      http://localhost:8080/api/inquiries/authenticated (allow to Submit inquiry by logged-in users, This api works but it is designed to work with frontend)
GET       http://localhost:8080/api/inquiries/user/{userId} (View user's support history, This api works but it is designed to work with frontend)

_____________________________________________________________________________

Admin Panel API's

GET       http://localhost:8080/api/transactions/filter?sort=asc (lookup transaction of all accounts in ascending order by id)
GET       http://localhost:8080/api/transactions/filter?sort=desc (lookup transaction of all accounts in descending order by id)
GET       http://localhost:8080/api/transactions/filter?type=DEPOSIT&minAmount=100&sort=asc (it works for all account,)
GET       http://localhost:8080/api/transactions/filter?minAmount=50&maxAmount=200 (it works for all account)
GET       http://localhost:8080/api/transactions/filter?startDate=2026-01-29T00:00:00&endDate=2026-01-29T23:59:59
GET       http://localhost:8080/api/transactions/filter?type=TRANSFER&sort=desc (sort transfers done from all accounts in a descending order)
GET       http://localhost:8080/api/transactions/filter?type=TRANSFER (sort transfers done from all accounts) need for individual accounts
GET       http://localhost:8080/api/transactions (shows all transaction activities in the database,)
(Deposit, Withdrawal, and Transfer)
POST      http://localhost:8080/api/accounts/deposit/account-number?accountNumber=5829242213&amount=25000.0 (checking)
POST      http://localhost:8080/api/accounts/deposit/account-number?accountNumber=7342036808&amount=10000.0 (saving)
POST      http://localhost:8080/api/accounts/withdraw/account-number?accountNumber=5829242213&amount=140.0  (checking)
POST      http://localhost:8080/api/accounts/withdraw/account-number?accountNumber=7342036808&amount=110.0  (saving)
POST      http://localhost:8080/api/accounts/transfer/account-number?fromAccountNumber=5829242213&toAccountNumber=7342036808&amount=150.00 (chk-sav)
POST      http://localhost:8080/api/accounts/transfer/account-number?fromAccountNumber=7342036808&toAccountNumber=5829242213&amount=250.00 (Sav - Chk)
GET       http://localhost:8080/api/accounts/transactions/account-number?accountNumber=5829229104 (to show all transaction history by account no)(works)
GET       http://localhost:8080/api/users  (gives you the entire details of the users in the database)
GET       http://localhost:8080/api/users/lookup?accountNumber=5829242213(this is used to pull out account info of individuals by account no, it doesn't matter what type of account no asfar is attached to one specific individual it will pull it out)
GET       http://localhost:8080/api/accounts/summary  (summary of all accounts in the database)
GET       http://localhost:8080/api/accounts/summary/by-account-number?accountNumber=5829242213 (Summary of individual balances by account no)
DELETE    http://localhost:8080/api/transactions/clear (this clear all transaction history in the database)
DELETE    http://localhost:8080/api/transactions/clear/by-account-number?accountNumber=7342036808 (clears all transaction history of individual account by account no.)
_________________________________________________________________________________

APIs for Alert

GET	    http://localhost:8080/api/alerts/user/{userId}	                     Get all alerts
GET	    http://localhost:8080/api/alerts/user/{userId}/unread/count	             Get unread count
GET	    http://localhost:8080/api/alerts/user/{userId}/unread	             Get only unread
PUT	    http://localhost:8080/api/alerts/{alertId}/read	                     Mark as read
PUT	    http://localhost:8080/api/alerts/{alertId}/unread	                     Mark as unread
PUT	    http://localhost:8080/api/alerts/user/{userId}/read-all	             Mark all as read
DELETE	    http://localhost:8080/api/alerts/{alertId}	                             Delete single
DELETE	    http://localhost:8080/api/alerts/batch?userId=123	                     Delete multiple
DELETE	    http://localhost:8080/api/alerts/user/{userId}/all	                     Delete all
GET	    http://localhost:8080/api/alerts/{alertId}	                             Get by ID

___________________________________________________________________________________

Manage Accounts
GET     http://localhost:8080/api/accounts/user/{userId}	 (List all accounts with details)(done)
PUT     http://localhost:8080/api/accounts/{accountId}/nickname	(Rename account)
GET     http://localhost:8080/api/accounts/{accountId}/details	(Account features, fees, interest)
___________________________________________________________________________________

2. Overdraft & Stop Payments APIs
Sidebar Item	API Needed	Purpose
Overdraft Services APIs
GET      http://localhost:8080/api/accounts/{accountId}/overdraft	(Get overdraft settings)
PUT      http://localhost:8080/api/accounts/{accountId}/overdraft	(Update overdraft protection)
___________________________________________________________________________________

Stop Payments
GET      http://localhost:8080/api/accounts/{accountId}/stop-payment ( List all stop payments)
GET      http://localhost:8080/api/accounts/{accountId}/stop-payments/active (List active stop payments)
POST     http://localhost:8080/api/accounts/{accountId}/stop-payment  (Place stop payment on check)
DELETE   http://localhost:8080/api/accounts/{accountId}/stop-payment/{stopPaymentId} (Remove stop payment)
GET      http://localhost:8080/api/accounts/stop-payment/{stopPaymentId}  ( Get stop payment by ID)
GET      http://localhost:8080/api/accounts/{accountId}/check/{checkNumber}/has-stop-payment  ( Check if check has stop payment)
___________________________________________________________________________________

Backend APIs needed for Download Activities

GET      http://localhost:8080/api/accounts/user/{userId} - Already exists
GET      http://localhost:8080/api/accounts/{accountId}/transactions - For preview
GET      http://localhost:8080/api/accounts/{accountId}/transactions/export - For download
GET      http://localhost:8080/api/accounts/download-history/1
GET      http://localhost:8080/api/accounts/download-history/1/recent
POST     http://localhost:8080/api/accounts/download-history
GET      http://localhost:8080**/api/accounts/{accountId}/statements?year={year}&month={month} - Get monthly statement**
GET      http://localhost:8080**/api/accounts/{accountId}/statements/export?year={year}&month={month} - Download statement PDF**
___________________________________________________________________________________

3. Direct Deposit & Recurring Payments APIs
GET     http://localhost:8080/api/accounts/1/direct-deposit
POST    http://localhost:8080/api/accounts/1/direct-deposit
GET     http://localhost:8080/api/accounts/1/recurring
POST    http://localhost:8080/api/accounts/1/recurring
GET     http://localhost:8080/api/accounts/1/recurring/1
PATCH   http://localhost:8080/api/accounts/1/recurring/1/pause
PATCH   http://localhost:8080/api/accounts/1/recurring/1/resume
PUT     http://localhost:8080/api/accounts/1/recurring/1
DELETE  http://localhost:8080/api/accounts/1/recurring/1
GET     http://localhost:8080/api/accounts/1/direct-deposit/999 (for exception handler)
____________________________________________________________________________________

4. Claims & Disputes APIs

POST    http://localhost:8080/api/claims (List all claims/disputes)
GET     http://localhost:8080/api/claims/user/1 (File new claim)
GET     http://localhost:8080/api/claims/1 (Get claim details)
PATCH   http://localhost:8080/api/claims/1/status (check claim status)
POST    http://localhost:8080/api/claims/1/documents (Upload supporting docs)
_____________________________________________________________________________________

Card Management APIs

GET     http://localhost:8080/api/cards/account/{accountId} - List all cards for a specific account
GET     http://localhost:8080/api/cards/user/1 (to check if a card is created)
POST    http://localhost:8080/api/cards/1/activate?pin=1234 (to activate card)
PUT     http://localhost:8080/api/cards/1/status (to freeze card if stolen or missing)
PUT     http://localhost:8080/api/cards/1/status (To unfreeze card)
PUT     http://localhost:8080/api/cards/1/pin (to change pin)
PUT     http://localhost:8080/api/cards/1/limits (To update card limits)
GET     http://localhost:8080/api/cards/1/limits (To get card limit verification)
POST    http://localhost:8080/api/cards/1/replace (to request card replacement)
GET     http://localhost:8080/api/cards/1 (check old card status)
POST    http://localhost:8080/api/cards/3/design (update card design)
POST    http://localhost:8080/api/cards/generate-for-user/7 (to generate card for users)
GET     http://localhost:8080/api/cards/admin/6/print (admin API to see card number for print)
POST    http://localhost:8080/api/cards/admin/print-batch (batch printing for multiple cards)
POST    http://localhost:8080/api/cards/verify-with-zip?cardNumber=5169209407306581&zipCode=21054 (verify card with zipcode)
POST    http://localhost:8080/api/card-payments/pay (to use card to pay money in your account)
______________________________________________________________________________________

Digital Wallet APIs

GET      http://localhost:8080/api/wallets/user/{userId}	(List connected wallets)
POST     http://localhost:8080/api/wallets/{walletId}/add-card	(Add card to wallet)
DELETE   http://localhost:8080/api/wallets/{walletId}/remove-card	(Remove from wallet)
POST     http://localhost:8080/api/wallets/create?userId=1&walletType=APPLE_PAY&deviceName=iPhone15Pro (To create a wallet)
POST     http://localhost:8080/api/wallets/1/add-card (To add physical card to the wallet)

_______________________________________________________________________________________

Foreign Currency APIs

GET     http://localhost:8080/api/currency/rates (to check rate)
GET     http://localhost:8080/api/currency/calculate?fromCurrency=USD&toCurrency=EUR&amount=500
GET     http://localhost:8080/api/currency/rates - Returns all exchange rates
GET     http://localhost:8080/api/currency/rate/{toCurrency} - Returns specific rate
GET     http://localhost:8080/api/currency/calculate - Calculates conversion with fees
POST    http://localhost:8080/api/currency/order - Places currency order
GET     http://localhost:8080/api/currency/orders/user/{userId} - Lists user orders
GET     http://localhost:8080/api/currency/orders/{orderId} - Gets order details
POST    http://localhost:8080/api/currency/orders/{orderId}/cancel - Cancels order

_______________________________________________________________________________________

New Account Services APIs

Business Account APIs customer-frontend

POST     http://localhost:8080/api/business/accounts/open
GET      http://localhost:8080/api/business/accounts/{accountId}
GET      http://localhost:8080/api/business/accounts/user/{userId}
PUT      http://localhost:8080/api/business/accounts/{accountId}/update
GET      http://localhost:8080/api/business/accounts/types  ( get a business types)
GET      http://localhost:8080/api/business/accounts/industries (get Industry)
POST     http://localhost:8080/api/business/accounts/open (Open a Business account)
GET      http://localhost:8080/api/business/accounts/1 (get business account by ID)
GET      http://localhost:8080/api/business/accounts/user/1 (get business account for user 1)
GET      http://localhost:8080/api/business/accounts/by-account/12 (get business account by linked account 12)
PUT      http://localhost:8080/api/business/accounts/1/update (update business account)
________________________________________________________________________________________

Admin panel APIs for business account

POST     http://localhost:8080/api/business/accounts/open - Customer submits application
GET      http://localhost:8080/api/business/accounts/user/1 - Customer views their applications
GET      http://localhost:8080/api/business/accounts/6 - Get specific account details
GET      http://localhost:8080/api/admin/business/applications  (to get all applications for business accounts)
GET      http://localhost:8080/api/admin/business/applications/1 (to get application by id)
POST     http://localhost:8080/api/admin/business/applications/1/approve (To approve application)
POST     http://localhost:8080/api/admin/business/applications/1/reject
GET      http://localhost:8080/api/admin/business/applications?status=PENDING (To get business accounts pending applications)
         http://localhost:8080/api/admin/business/applications
GET      http://localhost:8080/api/admin/business/applications/stats (to get stats)
POST     http://localhost:8080/api/business/accounts/{accountId}/close?reason=Your reason here (to close the account)
GET      http://localhost:8080/api/business/accounts/1 (to get account )
DELETE   http://localhost:8080/api/business/accounts/1 (to delete the business account permanently)

________________________________________________________________________________________


Manage users APIs  by Admin panel

Close an Account
DELETE    http://localhost:8080/api/accounts/{accountId} (Close account)
POST      http://localhost:8080/api/accounts/{accountId}/close	(Initiate closure with reason)
GET       http://localhost:8080/api/users  (gives you the entire details of the users in the database)
POST      http://localhost:8080/api/accounts/1/disable (to disable account) (UPDATE accounts SET is_disabled = false WHERE is_disabled IS NULL;)(when
          disable field i null in the database)
POST      http://localhost:8080/api/accounts/8/enable (to enable account)

________________________________________________________________________________________


Manage users APIs by HR

DELETE    http://localhost:8080/api/accounts/{accountId}  (- Delete regular account)
DELETE    http://localhost:8080/api/transactions/clear/by-account-number?accountNumber=xxx  (- Clear transaction history)
DELETE    http://localhost:8080/api/transactions/clear (To clear the whole transaction in the database
DELETE    http://localhost:8080/api/business/accounts/{accountId}  (- Delete business account)
DELETE    http://localhost:8080/api/users/{userId}  (Delete users Accounts)
GET       http://localhost:8080/api/users  (gives you the entire details of the users in the database)
_________________________________________________________________________________________

Manage Employees APIs by HR


GET       http://localhost:8080/api/employees/admin/all (to get all employees)
PUT       http://localhost:8080/api/employees/admin/9/disable (to disable employee)
PUT       http://localhost:8080/api/employees/admin/9/enable  ( to enable employee)
POST      http://localhost:8080/api/employees/admin/9/reset-password (to reset password for HR)
DELETE    http://localhost:8080/api/employees/admin/9 ( to delete employee)

___________________________________________________________________________________________
 

working API for Admin-panel

Post     http://localhost:8080/api/employees/register (To register employee)
GET      http://localhost:8080/api/employees/admin/pending (return employee info as pending)
GET      http://localhost:8080/api/employees/admin/{id} (- Get employee details)
POST     http://localhost:8080/api/employees/admin/1/approve (to approve employment by admin)

DELETE   http://localhost:8080/api/employees/admin/1 (To delete employee by HR)
POST     http://localhost:8080/api/employees/login (To login after HR approve employment)
GET      http://localhost:8080/api/employees/admin/all (To get all employees)
GET      http://localhost:8080/api/employees/admin/by-email?email=snopitech%2B1%40gmail.com(get employee by Email)
GET      http://localhost:8080/api/employees/admin/search?q=Michael(to get employees by first name)
GET      http://localhost:8080/api/employees/admin/search?q=Agbonifo(to get employees by last name)
DELETE   http://localhost:8080/api/employees/admin/delete-all (to delete all employee without safety)
__________________________________________________________________________________________

Admin profile APIs

GET   http://localhost:8080/api/employees/admin/{id}  (- Get employee details)
POST  http://localhost:8080/api/auth/employee/forgot-password (- Reset password flow)
PUT   http://localhost:8080/api/employees/change-password
PUT   http://localhost:8080/api/employees/admin/{id}
PUT   http://localhost:8080/api/employees/{id}/update-profile
PUT   http://localhost:8080/api/employees/update-profile
___________________________________________________________________________________________

APIs for Transaction History

GET /api/accounts/{accountId}/transactions (for checking)
GET /api/accounts/transactions/account-number?accountNumber={accountNumber}  (for savings)
GET /api/accounts/{linkedAccountId}/transactions (For business account)
GET /api/credit/accounts/{accountId}/transactions?userId={userId} (For credit account)
_________________________________________________________________________________________

APIs for clearing account history

DELETE /api/transactions/clear/by-account-number?accountNumber={accountNumber} (for checking/savings)
DELETE /api/transactions/clear/by-account-id?accountId={accountId} (checking /savings)
DELETE /api/transactions/clear (clear all transaction history in the data base)
DELETE /api/transactions/clear/by-account-number?accountNumber={linkedAccountNumber} (business account)
DELETE api/credit/admin/credit/accounts/5/transactions/clear (credit account)
______________________________________________________________________________________

APIs for deleting account numbers

DELETE /api/accounts/{accountId} (checking/savings)
DELETE /api/business/accounts/{accountId} (business account)
DELETE /api/credit/hr/credit/accounts/{accountId} (delete credit )
______________________________________________________________________________________

CHECKING/SAVINGS ACCOUNTS

Disable: POST /api/accounts/{accountId}/disable
Enable: POST /api/accounts/{accountId}/enable
_____________________________________________________________________________________

APIs for Disabling and enabling BUSINESS ACCOUNTS

POST /api/business/accounts/{accountId}/disable?reason=Disabled+by+admin (Disable:)
POST /api/business/accounts/{accountId}/enable (Enable:)
______________________________________________________________________________________

APIs for Disabling and enabling CREDIT ACCOUNTS

POST /api/credit/admin/credit/accounts/{accountId}/freeze  (Freeze (Disable)
POST /api/credit/admin/credit/accounts/{accountId}/unfreeze (Unfreeze (Enable)
________________________________________________________________________________________

APis for credit card purchase and repay

POST /api/credit-card-payments/pay (pay to any account)
POST /api/credit-card-payments/payoff (Pay credit card FROM any account)
GET /api/credit/accounts/{accountId}/transactions (creadit card transaction history)
______________________________________________________________________________________

POST http://localhost:8080/auth/reset-password
______________________________________________________________________________________


GET http://localhost:8080/api/employees/admin/all  (to get all employees)

GET http://localhost:8080/api/employees/totp/status?employeeId=8 (To get employee list)
_______________________________________________________________________________________

TOTP setup

POST http://localhost:8080/api/employees/totp/setup?employeeId=8

Dpownload microsoft aunthenticator and scan or type the code  IlTnh34Uq3NrjJ9D7LUnAlU5cLc

POST http://localhost:8080/api/employees/totp/verify-and-enable

{
  "employeeId": 8,
  "code": "123456"
}
POST http://localhost:8080/api/employees/totp/verify

{
  "employeeId": 8,
  "code": "123456"
}
POST http://localhost:8080/api/employees/totp/disable

{
  "employeeId": 8,
  "password": "your-password"
}
GET  http://localhost:8080/api/employees/admin/pending
GET  http://localhost:8080/api/employees/admin/approved
GET  http://localhost:8080/api/employees/admin/8
GET  http://localhost:8080/api/employees/admin/by-email?email=michael@snopitech.com
GET  http://localhost:8080/api/employees/admin/search?q=michael
POST http://localhost:8080/api/employees/login
Content-Type: application/json

{
  "email": "michael@snopitech.com",
  "password": "your-password"
}
_________________________________________________________________________

npm install qrcode.react  (for qr code)
__________________________________________________________________________


GET http://localhost:8080/api/employees/totp/status?employeeId=8 (To check employee 8's current TOTP status)


POST http://localhost:8080/api/employees/admin/8/reset-totp
{
  "message": "TOTP has been reset for employee. They can now log in without 2FA.",
  "employee": {
    "id": 8,
    "totpEnabled": false,
    "totpSetupCompleted": false,
    ...
  }
}
________________________________________________________________________________

Api for admin to unlock account login after fail attempt
POST http://localhost:8080/auth/admin/unlock-user/8  ( Admin unlocked login)
________________________________________________________________________________

HR-dash APIs for MFA

POST  http://localhost:8080/api/hr/auth/login (First step - sends code to email)
POST  http://localhost:8080/api/hr/auth/verify	(Second step - verifies code and logs in)
POST  http://localhost:8080/api/hr/auth/resend	(Resends code (before verification)
POST  http://localhost:8080/api/hr/auth/admin/unlock/10 (to unlock MFA for hr-employees)
________________________________________________________________________________

APIs for NonUSCitizenVerification document for the Admin to open account

GET     http://localhost:8080/api/verification/test (to show Verification controller is working!)
POST    http://localhost:8080/api/verification/upload-document (to upload passport)
GET	http://localhost:8080/api/verification/status/{userId}	(Check verification status)
GET	http://localhost:8080/api/verification/document/{verificationId} (Get document metadata)
GET	http://localhost:8080/api/verification/document/{verificationId}/download (Download document file)

GET      http://localhost:8080/api/admin/verifications/pending (List all pending)
GET      http://localhost:8080/api/admin/verifications/{id} (Get details)
GET      http://localhost:8080/api/admin/verifications/{id}/download (View/download document)
POST     http://localhost:8080/api/admin/verifications/{id}/approve (Approve)
POST     http://localhost:8080/api/admin/verifications/{id}/reject (Reject)

DELETE   http://localhost:8080/api/admin/verifications/2
DELETE   http://localhost:8080/api/admin/verifications/3

DELETE FROM pending_verifications; (queries to delete pending verification from the database)

START TRANSACTION;
DELETE FROM pending_verifications WHERE id = 10;
-- Check if correct
SELECT * FROM pending_verifications WHERE id = 10; -- Should show 0 rows
-- If everything looks good
COMMIT;
-- If something went wrong
ROLLBACK;

SELECT id, email, first_name, last_name, document_number, issuing_country, expiry_date
FROM pending_verifications
ORDER BY id DESC;   (to show actual regustration id)
______________________________________________________________________________________________

APIs for USCitizenVerification document for the Admin to open account

POST	http://localhost:8080/auth/us-verification/submit (Submit US citizen verification with all user data)
GET	http://localhost:8080/auth/us-verification/status/{email}(Check if user has pending verification)
GET	http://localhost:8080/api/admin/us-verifications/pending(Get all pending verifications)
GET	http://localhost:8080/api/admin/us-verifications/approved(Get all approved verifications)
GET	http://localhost:8080/api/admin/us-verifications/rejected(Get all rejected verifications)
GET	http://localhost:8080/api/admin/us-verifications/{id}(Get full verification details by ID)
GET	http://localhost:8080/api/admin/us-verifications/search?term=Search verifications by name/email
POST	http://localhost:8080/api/admin/us-verifications/{id}/approve?adminUsername=Approve verification and create user account
POST	http://localhost:8080/api/admin/us-verifications/{id}/reject?adminUsername=&reason=Reject verification with reason
GET	http://localhost:8080/api/admin/us-verifications/stats(Get verification statistics)
GET	http://localhost:8080/api/admin/us-verifications/test(Test endpoint)
_______________________________________________________________________________________________


APIs for Cleaning up verification history from HR

DELETE    http://localhost:8080/api/admin/verifications/cleanup?olderThanDays=30(# Delete all verifications older than 30 days)
DELETE    http://localhost:8080/api/admin/verifications/cleanup (# Delete ALL verifications (use carefully!))
_______________________________________________________________________________________________

APIs for loan account

GET     http://localhost:8080/api/loan/accounts
GET     http://localhost:8080/api/loan/accounts/{id}
POST    http://localhost:8080/api/loan/accounts/{id}/reveal
POST    http://localhost:8080/api/loan/accounts/{id}/transfer (Borrow money)
POST    http://localhost:8080/api/loan/accounts/{id}/payment (Pay back)
GET     http://localhost:8080/api/loan/accounts/{id}/payments
______________________________________________________________________________________________

APIs for check deposit

POST /api/checks/deposit
GET /api/checks/user/{userId}
GET /api/checks/{checkId}
GET /api/checks/{checkId}
GET /api/admin/checks/pending
GET /api/admin/checks/approved
GET /api/admin/checks/rejected
GET /api/admin/checks/stats
GET /api/admin/checks/{checkId}
POST /api/admin/checks/{checkId}/approve
POST /api/admin/checks/{checkId}/reject
____________________________________________________________________________________________




