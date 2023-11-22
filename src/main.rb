require "sinatra"
require "json"
require_relative 'database'
require_relative 'setup_handlebars'
require_relative 'dj'

db = Database.new
db.scan_tracks

templates = setupHandlebars

get '/' do
  templates['index'].call()
end

get '/playlist' do
  content_type :json
  DJ.playlist(db.get_all_tracks, 20).to_json
end

get '/track/:album/:file' do |album, file|
  send_file File.join(File.dirname(__FILE__), '../music/', album, file)
end

post '/listened' do
  data = JSON.parse(request.body.read)
  uuid = data['uuid']
  db.update_track_dangerous(uuid, { times_listened: 'times_listened + 1' })
  status 204
end

post '/vote' do
  data = JSON.parse(request.body.read)
  uuid = data['uuid']
  direction = data['direction']
  if direction == 'up'
    db.update_track_dangerous(uuid, { upvotes: 'upvotes + 1' })
  elsif direction == 'down'
    db.update_track_dangerous(uuid, { upvotes: 'upvotes - 1' })
  end
  status 204
end

post '/deleteTrack' do
  data = JSON.parse(request.body.read)
  uuid = data['uuid']
  db.update_track_dangerous(uuid, { deleted: 'TRUE' })
  return '<button> restore? </button>'
end

get '/static/:file' do |file|
  send_file File.join(File.dirname(__FILE__), '../static/', file)
end

puts "autorave listening on https://localhost:4567/"
