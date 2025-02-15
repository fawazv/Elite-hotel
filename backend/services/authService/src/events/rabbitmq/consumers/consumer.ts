import { getChannel } from "../../../config/rabbitmq";
import { AuthService } from "../../../services/implementation/auth.service";




export const consumerUserQueue = async (authService:AuthService) => {
    try {
        const channel = getChannel()
        const queue = "userData"

        await channel.assertQueue(queue, {durable: true})
        channel.consume(queue, async (msg) => {
            if(msg !== null) {
                const payload = JSON.parse(msg.content.toString())
                console.log(msg,"msg i");
                await authService.u
            }
        })
    }
}