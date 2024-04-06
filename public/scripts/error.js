<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="https://res.cloudinary.com/dfezowkdc/image/upload/v1697096319/kickstore_logo_dbympn.png">
    <title>KickStore - home</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link
      href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/stylesheets/error.css" />
  </head>
  <body>
    <div id="error" class="d-flex flex-column align-items-center fw-bold">
      <i id="icon" class="bx bxs-error"></i>
      <div id="title" style="font-size: 2rem">OOPS! ERROR HAS OCCURED</div>

      <div id="message"><%= error %></div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js"></script>
  </body>
</html>
