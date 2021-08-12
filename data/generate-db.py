import random, json
file = open("data/movies-db","r")
line = [line.rstrip('\n') for line in file]
    
out = []
for i in list(range(30)):
    obj={}
    obj["title"] = line[i*4]
    obj["duration"] = line[i*4+1]
    obj["description"] = line[i*4+2]
    obj["img"] = line[i*4+3]
    out.append(obj)
for i in list(range(10)): # Process first 10 movies
    showings = []
    for ij in list(range(6)):
        day = int(1 + (random.random() * 6))
        hour = int(10 + (random.random() * 11))
        minute = int((random.random() * 59))
        for j in list(range(4)):
            show = {}
            #date = str(int(hour)) + ":" + str(int(minute)) + "-" + str(int(day)) + "-8-2020"
            show["hour"] = hour
            show["minute"] = minute
            show["day"] = (day + j * 7)
            show["price"] = round(10 + (random.random() * 50)) + 0.99
            seats = []
            rran = random.random() - 0.5
            for m in list(range(15)):
                s = ""
                for n in list(range(30)):
                    s = s + str(int(round(random.random() + rran)))
                seats.append(s)
            show["seats"] = seats
            showings.append(show)
    out[i]["showings"] = showings
for i in list(range(10,30)): # Process movies from 10 to 30
    showings = []
    for j in list(range(10)):
        show = {}
        day = int(1 + (random.random() * 30))
        hour = int(10 + (random.random() * 11))
        minute = int((random.random() * 59))
        #date = str(int(hour)) + ":" + str(int(minute)) + "-" + str(int(day)) + "-8-2020"
        show["hour"] = hour;
        show["minute"] = minute;
        show["day"] = day;
        show["price"] = round(10 + (random.random() * 50)) + 0.99
        seats = []
        rran = random.random() - 0.5
        for m in list(range(15)):
            s = ""
            for n in list(range(30)):
                s = s + str(int(round(random.random() + rran)))
            seats.append(s)
        show["seats"] = seats
        showings.append(show)
    out[i]["showings"] = showings
fileout = open("data/db.json","w")
fileout.write(json.dumps(out,indent=4,sort_keys=True))
fileout.close()