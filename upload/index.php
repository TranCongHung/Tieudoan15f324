<?php
// Set proper MIME type for HTML
header('Content-Type: text/html; charset=utf-8');

// Include the JavaScript content inline
$jsContent = file_get_contents(__DIR__ . '/assets/index-DmR4l477.js');
?>
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tiểu đoàn 15 - Sư đoàn 324</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              inter: ['Inter', 'sans-serif'],
              merriweather: ['Merriweather', 'serif'],
              playfair: ['Playfair Display', 'serif'],
            },
            colors: {
              'army-green': '#4a5d23',
              'army-brown': '#8b4513',
              'army-beige': '#f5e6d3',
              'army-dark': '#2c3e50',
            },
            animation: {
              'fade-in': 'fadeIn 0.5s ease-in-out',
              'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
              fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
              },
              slideUp: {
                '0%': { transform: 'translateY(10px)', opacity: '0' },
                '100%': { transform: 'translateY(0)', opacity: '1' },
              },
            },
          },
        },
      };
    </script>
    <script type="module">
      <?php echo $jsContent; ?>
    </script>
  </head>
  <body class="bg-texture">
    <div id="root"></div>
  </body>
</html>
