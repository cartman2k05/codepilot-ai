import httpx
import json

def test_api():
    try:
        # 1. Login to get token
        login_url = "http://localhost:8000/api/auth/demo-login"
        payload = {"username": "steve"}
        res = httpx.post(login_url, json=payload)
        print("Login status:", res.status_code)
        if res.status_code != 200:
            print("Login failed:", res.text)
            return
            
        data = res.json()
        token = data["access_token"]
        print("Token retrieved:", token[:15] + "...")
        
        # 2. Fetch dashboard
        dash_url = "http://localhost:8000/api/dashboard/"
        headers = {"Authorization": f"Bearer {token}"}
        res_dash = httpx.get(dash_url, headers=headers)
        print("Dashboard status:", res_dash.status_code)
        if res_dash.status_code != 200:
            print("Dashboard failed error payload:", res_dash.text)
        else:
            print("Dashboard Success payload:")
            print(json.dumps(res_dash.json(), indent=2))
            
    except Exception as e:
        print("Exception during request:", str(e))

if __name__ == "__main__":
    test_api()
