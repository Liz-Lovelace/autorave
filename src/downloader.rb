require 'json'

def fetch_youtube_info(url)
  # Run youtube-dl with --dump-json
  command = "youtube-dl -x --audio-format mp3 -o "%(playlist)s/%(title)s.%(ext)s" #{url}"
  puts command
  
  output = %x[ #{command} ]

  # Check if the command was successful
  unless $?.success?
    puts "Error executing command."
    return
  end
end

puts 'hi1'
fetch_youtube_info('https://patriciataxxon.bandcamp.com/album/agnes-hilda')
puts 'hi'

