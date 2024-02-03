browser-sync start --proxy 'localhost:4567' --files 'templates/*' 'src/*' 'static/*' --no-open --reload-delay 800 &
ls src/* templates/* static/* | entr -cr ruby src/main.rb 

