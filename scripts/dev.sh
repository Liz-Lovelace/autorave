browser-sync start --proxy 'localhost:4567' --files 'templates/*' 'src/*' --no-open --reload-delay 500 &
ls src/* templates/* | entr -cr ruby src/main.rb 

