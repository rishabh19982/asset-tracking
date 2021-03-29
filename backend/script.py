import requests
import datetime
import json
import time

headers={'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwNjIyN2I3MGU3YWM3MDAxNWUwYjQ5MyIsImlhdCI6MTYxNzA0NTQzMiwiZXhwIjoxNjE3MTMxODMyfQ.iMncNjbz-6KE21AjhrKXJWaU1waXsrQJFXrrg4mj8u4' ,'Content-Type': 'application/json', 'Accept': 'text/plain'}

def create_user():
    data = {
        'name': "Charu",
        'type': "Person",
        'status' : "non-active"
    }
    request = json.dumps(data)
    try:
        resp = requests.post(
            data=request, url='https://jumbogps-t2-backend.herokuapp.com/createAsset',headers=headers)
        print("Response Status Code: " + str(resp.text))
    except requests.exceptions.ConnectionError:
        print(
            '\n\nError: Could not create user. Make sure you have started the server!!!\n\n')

def get_cor():
    coordinates = []
    try:
        resp = requests.get(url='https://api.mapbox.com/directions/v5/mapbox/walking/72.851443%2C19.309806%3B72.849109%2C19.295863?alternatives=true&geometries=geojson&steps=true&access_token=pk.eyJ1IjoicmlzaGFiaDI5MDUiLCJhIjoiY2ttNTNjcmo2MGFrbTJvcmIyZDduYnFjcyJ9.tMGrepSQY-N-iDwN7SeUfQ')
        # print("Response : " + str(resp.json()))
        res = resp.json()
        duration = 0
        # print(res)
        for route in res['routes']:
            duration += route['duration']
            for legs in route['legs']:
                for step in legs['steps']:
                    for cor in step['geometry']['coordinates']:
                        # print(cor[0],cor[1])
                        coordinates.append({'lt':cor[1],'lg':cor[0]})
        return coordinates,duration
    except requests.exceptions.ConnectionError:
        print(
            '\n\nError: Could not get coordinates. Make sure you have started the server!!!\n\n')

def changeStatus(status,tripName=None):
    source = {
        'lat' : '19.316815',
        'lng' : '72.854570'
    }
    destination = {
        'lat' : '19.305963',
        'lng' : '72.857173'
    }
    data = {
        'id' : 7,
        'status' : status,
        'tripName': tripName,
        'sLocation' : source,
        'dLocation' : destination
    }
    request = json.dumps(data)
    print(request)
    try:
        resp = requests.put(
            data=request, url='https://jumbogps-t2-backend.herokuapp.com/changeStatus',headers=headers)
        print("Response Status Code: " + str(resp.text))
    except requests.exceptions.ConnectionError:
        print(
            '\n\nError: Could not post coordinates. Make sure you have started the server!!!\n\n')


def share_cor():
    coordinates,duration =  get_cor()
    sleep_duration = duration / len(coordinates)
    print(sleep_duration)
    changeStatus('non-active','trip6')
    for i in range(2):
        data = {
            'id': 7,
            'lt': coordinates[i]['lt'],
            'lg': coordinates[i]['lg'],
            'timeStamp' : datetime.datetime.now().isoformat()
        }
        try:
            request = json.dumps(data)
            resp = requests.put(
                data=request, url='https://jumbogps-t2-backend.herokuapp.com/postLocation',headers=headers)
            print("Response Status Code: " + str(resp.text))
        except requests.exceptions.ConnectionError:
            print(
                '\n\nError: Could not post coordinates. Make sure you have started the server!!!\n\n')
        # time.sleep(sleep_duration)
    #changeStatus('non-active')

def getAsset():
    data = {
        'name': "Rishi",
        'type': "Person",
        'status' : "non-active"
    }
    try:
        resp = requests.get(
            url='https://jumbogps-t2-backend.herokuapp.com/assets?type=Person')
        print("Response Status Code: " + str(resp.status_code))
    except requests.exceptions.ConnectionError:
        print(
            '\n\nError: Could not create user. Make sure you have started the server!!!\n\n')


if __name__ == '__main__':
    #create_user()
    #share_cor()
    getAsset()