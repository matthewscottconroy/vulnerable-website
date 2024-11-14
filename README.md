# vulnerable-website

This project is a demonstration of several common vulnerabilities that a website might have that can be exploited by attackers.

### 1. **SQL Injection (SQLi)**

**What it is:**  
SQL Injection is a type of attack where an attacker can inject malicious SQL code into a query to manipulate the database. This usually occurs when user input is directly embedded in SQL queries without validation or sanitization.

**How the exploit works:**  
In our `/login` route, the SQL query directly incorporates user input:

```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

If a user enters `admin` for the username and a password like `' OR '1'='1`, the query becomes:

```sql
SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1';
```

Since `1=1` is always true, this query will bypass authentication, allowing the attacker to log in without knowing the actual password.

**Why it’s dangerous:**  
With SQL Injection, attackers can:
- Bypass authentication.
- Access, modify, or delete sensitive data.
- Potentially execute administrative operations on the database, including dropping tables or accessing other user information.

**How to secure it:**  
Use parameterized queries to separate user input from the query structure. For example:

```javascript
const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
pool.query(query, [username, password], (err, result) => { ... });
```

---

### 2. **Cross-Site Scripting (XSS)**

**What it is:**  
Cross-Site Scripting is a vulnerability that allows attackers to inject malicious JavaScript or HTML into a webpage viewed by other users. This often occurs when user input is directly rendered on a page without sanitization.

**How the exploit works:**  
In our `/comments` route, users can submit comments. If someone enters `<script>alert('XSS!');</script>` as a comment, the application directly renders this code in the HTML:

```html
<li>{{{this}}}</li>
```

Using `{{{this}}}` in Handlebars tells it to render the content as HTML, allowing the script to execute. This will trigger an alert box, demonstrating the vulnerability. However, a real attacker could use JavaScript to steal cookies, redirect users, or inject other malicious content.

**Why it’s dangerous:**  
XSS can lead to:
- Theft of session cookies, allowing attackers to hijack user accounts.
- Injection of fake login forms to capture user credentials.
- Modification of the page content, potentially displaying false information or redirecting users to malicious sites.

**How to secure it:**  
Sanitize and escape user input before displaying it. Using double braces (`{{this}}`) in Handlebars automatically escapes potentially dangerous characters:

```html
<li>{{this}}</li>
```

Alternatively, libraries like `xss-clean` can be used to sanitize user inputs on the server.

---

### 3. **Insecure Session Management**

**What it is:**  
Session management vulnerabilities arise when session data is stored insecurely or can be easily accessed or hijacked by attackers. Poor session handling makes it possible for attackers to impersonate other users by using their session identifiers.

**How the exploit works:**  
In this example, sessions are stored in cookies without secure flags, making them vulnerable to interception. If an attacker can obtain a session cookie by any means (e.g., via XSS, physical access, or network interception), they can copy it into their own browser and access the victim’s session:

```javascript
app.use(session({
    secret: 'vulnerable_secret',
    resave: false,
    saveUninitialized: true,
}));
```

By using a cookie without setting the `secure` or `httpOnly` flags, an attacker could hijack a session by obtaining or manipulating the cookie data.

**Why it’s dangerous:**  
Insecure session management can lead to:
- Session hijacking, where attackers impersonate users.
- Man-in-the-middle attacks, where attackers intercept session cookies on insecure networks.
- Access to sensitive data in sessions without authentication.

**How to secure it:**  
Use `secure` and `httpOnly` flags in session cookies and set `sameSite` if possible. Here’s an example of secure session configuration:

```javascript
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,    // Only send cookie over HTTPS
        httpOnly: true,  // Prevent JavaScript access to the cookie
        sameSite: 'strict' // Prevent cross-site request forgery
    }
}));
```

---

### Summary of Each Vulnerability

1. **SQL Injection (SQLi):** Injects malicious SQL commands, leading to unauthorized data access or modifications. Prevent by using parameterized queries.
2. **Cross-Site Scripting (XSS):** Injects JavaScript into webpages, potentially compromising user data and account security. Prevent by sanitizing and escaping user input.
3. **Insecure Session Management:** Exposes sessions to hijacking through insecure cookie handling. Secure with `secure`, `httpOnly`, and `sameSite` flags.
