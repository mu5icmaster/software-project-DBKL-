import subprocess
import time

import bcrypt
import base64
import hashlib


def check_docker_installed():
    try:
        subprocess.run(
            ["docker", "--version"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except subprocess.CalledProcessError:
        print("Error: docker is not installed or not in the PATH.")
        print(
            "Please install docker at https://www.docker.com/ and make sure it is in the PATH."
        )
        exit(1)


def check_docker_running():
    try:
        subprocess.run(
            ["docker", "info"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except subprocess.CalledProcessError:
        print("Error: docker is not running.")
        exit(1)


def check_container_exists():
    result = subprocess.run(
        ["docker", "ps", "-a", "--format", "{{.Names}}"], stdout=subprocess.PIPE
    )
    return "mysql_container" in result.stdout.decode()


def check_container_running():
    result = subprocess.run(
        ["docker", "ps", "--format", "{{.Names}}"], stdout=subprocess.PIPE
    )
    return "mysql_container" in result.stdout.decode()


def start_container():
    subprocess.run(["docker", "start", "mysql_container"], check=True)


def create_container():
    subprocess.run(
        [
            "docker",
            "run",
            "--name",
            "mysql_container",
            "-e",
            "MYSQL_ROOT_PASSWORD=Pass1",
            "-p",
            "3306:3306",
            "-d",
            "mysql:9.1.0",
        ],
        check=True,
    )


def wait_for_mysql():
    while True:
        result = subprocess.run(
            [
                "docker",
                "exec",
                "mysql_container",
                "mysql",
                "-uroot",
                "-pPass1",
                "-e",
                "SELECT 1",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        if result.returncode == 0:
            break
        print("Waiting for MySQL to be ready...")
        time.sleep(2)


def run_init_sql():
    ADMIN_PASSWORD = "Pass1"
    # See bottom of https://pypi.org/project/bcrypt/ for hashing explanation
    hashed_password = bcrypt.hashpw(
        base64.b64encode(hashlib.sha256(ADMIN_PASSWORD.encode()).digest()),
        bcrypt.gensalt(),
    ).decode("utf-8")

    with open("init.sql", "r") as f:
        sql = f.read()
        sql = sql.replace("ADMIN_PASSWORD_HASH", hashed_password)

    subprocess.run(
        ["docker", "exec", "-i", "mysql_container", "mysql", "-uroot", "-pPass1"],
        input=sql.encode("utf-8"),
        check=True,
    )


def main():
    check_docker_installed()
    check_docker_running()

    # Warning and confirmation
    print("WARNING: This will initialize the database and remove all existing data.")
    confirmation = input("Are you sure you want to continue? (yes/no): ")
    if confirmation.lower() != "yes":
        print("Initialization aborted.")
        exit(0)

    if check_container_exists():
        print("MySQL container exists.")
        if not check_container_running():
            print("Starting existing MySQL container...")
            start_container()
    else:
        print("Creating a new MySQL container...")
        create_container()

    wait_for_mysql()
    run_init_sql()
    print("Database initialized.")


if __name__ == "__main__":
    main()

    # Run this in your terminal if you need to manually connect to the database
    # docker exec -it mysql_container mysql -uroot -pPass1
