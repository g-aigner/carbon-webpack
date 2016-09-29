import React from "react"   
import { render } from "react-dom"

import HelloWorld from "./HelloWorld"
import Button from "carbon/lib/components/button"


const sayHello = () => alert("Hello!")

render(
    <div>
        <HelloWorld name="Carbon" />
        <Button
            as="primary"
            onClick={ sayHello }
        >
            Say "Hello!"
        </Button>
    </div>,
    document.getElementById("root")
)