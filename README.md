## 🚀 Getting Started

**System Requirements:**

* **Python**: `version 3.12`
* **Node**: `version 22.10.0`
* **Docker** `version 26.1.4`

### ⚙️ Installation

<h4>From <code>source</code></h4>

> 1. Clone the software-projecto repository:
>
> ```console
> $ git clone https://github.com/mu5icmaster/software-projecto
> ```
>
> 2. Change to the project directory:
> ```console
> $ cd software-projecto
> ```
>
> 3. Install the dependencies:
> ```console
> $ pip install -r requirements.txt
> $ npm install
> ```
>
> 4. Initialize the MySQL Database:
> ```console
> $ python init-db.py
> ```

### 🤖 Usage

<h4>From <code>source</code></h4>

> Run software projecto using the command below:
> ```console
> $ node index.js
> ```
> The application will launch, and you will be directed to the login screen. Enter the default administrator 
> credentials to access the 
> dashboard.
> ```console
> Email: admin@gmail.com
> Password: Pass1
> ```

### ⚠️ Known Issues

- **DeepFace Compatibility**: As of 1/11/2024, the `deepface` library requires the `tensorflow` dependency, which does not support Python 3.13.0. As a result, the application will not run if you are using Python 3.13.0. Please ensure you are using a compatible version of Python (Python 3.9 to 3.12) to avoid this issue.

- **TensorFlow Dependency**: The latest version of `tensorflow`, `tensorflow 2.18.0` requires the `tf-keras` package. To resolve this issue, you can either install the `tf-keras` package by running `pip install tf-keras` or downgrade TensorFlow to a compatible version.