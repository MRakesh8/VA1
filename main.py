import requests

FILES = ["index.html", "style.css", "script.js"]

def read_project_files():
    content = ""
    for file in FILES:
        try:
            with open(file, "r", encoding="utf-8") as f:
                content += f"\n\n----- {file} -----\n\n"
                content += f.read()
        except:
            pass
    return content


def update_project(instruction):
    current_code = read_project_files()

    prompt = f"""
You are a professional web developer.

Modify the project based on this instruction:

Instruction:
{instruction}

Project Files:
{current_code}

Return updated full code for each modified file.
Clearly separate files using:
----- filename -----
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3:8b",
            "prompt": prompt,
            "stream": False
        }
    )

    output = response.json()["response"]

    for file in FILES:
        if f"----- {file} -----" in output:
            new_code = output.split(f"----- {file} -----")[1].split("-----")[0]
            with open(file, "w", encoding="utf-8") as f:
                f.write(new_code.strip())

    print("✅ Website Updated Successfully!")


while True:
    command = input("\nWhat change do you want? (exit to stop): ")

    if command.lower() == "exit":
        break

    update_project(command)