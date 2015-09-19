#!/bin/env ruby

require 'excon'
require 'json'
require 'terminal-table'
require 'set'
require 'colored'

def print_all_event_data(data, head, title)
  table = Terminal::Table.new do |t|
    memory = {
      "all_events" => data
    }
    data.each do |event|
      memory['event'] = event
      r = head.map { |h| process_value(h, event[h], memory) }
      t.add_row r
    end
  end
  table.title = title
  table.headings = head
  # table.style = {:width => 160}
  puts table.to_s
end

def all_keys(data)
  keys = Set.new
  data.each do |event|
    keys |= Set.new(event.keys)
  end
  return keys
end

def process_value(key, value, memory)
  
  all_events = memory['all_events']
  event = memory['event']
  event_id = event['event_id']

  case key
  when "timestamp"
    # timestamp - convert to human readable
    new_value = Time.at(value/1000).strftime('%Y-%m-%d %H:%M:%S')
  when "uptime"
    seconds = value.to_i
    days = (value.to_f / (24 * 60 * 60)).round
    new_value = "#{days} day#{days > 1 ? 's' : ''} (#{seconds}s)"
  when "token"
    # add the number of the event for this token
    token_memory = memory['token_memory'] || Hash.new(0)
    count = token_memory[value] + 1
    token_memory[value] = count
    memory['token_memory'] = token_memory
    new_value = "#{value} -> #{count}"

    # color first and last event for this token
    all = all_events.select { |e| e['token'] == value }

    is_first = all.first['event_id'] == event_id
    new_value = new_value.green if is_first
    new_value = new_value.yellow if !is_first && all.last['event_id'] == event_id

  when "running_syncers"
    new_value = value.to_i > 0 ? value.to_s.green : value.to_s.red
  when "event_type"
    new_value = value == 'heartbeat' ? value.green : value.blue
  else
    new_value = value 
  end
  return new_value
end

def filter_json(json, keys)
  new_json = {}
  json.each do |k,v|
    new_json[k] = v if keys.member?(k)
  end
  return new_json
end

def download_data
  response = Excon.get("https://builda-ekg.herokuapp.com/v1/beep/all")
  raise "Failed to fetch data #{response.body}" unless response.status == 200
  return JSON.parse(response.body)
end

def print_table(downloaded, headers, name)
  print_all_event_data(downloaded, headers, name)
end

def map_tokens_to_events(data)
  map = {}
  data.each { |e| map[e['token']] = (map[e['token']] || []) << e }
  return map
end

# run
downloaded = download_data
headers = [
  "timestamp",
  "event_id",
  "token", 
  "event_type", 
  "version", 
  "build", 
  "uptime", 
  "running_syncers"
]

# print all events
print_table(
  downloaded, 
  headers,
  "all ekg data"
)

puts "\n\t\t\t----\n\n"

# print events for each token
map_tokens_to_events(downloaded).each do |token, events|
  print_table(
    events, 
    headers, 
    "ekg data for token #{token}"
  )
end




