import { bcriptAdapter, envs, JwtAdapter } from '../../config';
import { UserModel } from '../../data';
import { CustomError, LoginUserDto, UserEntity } from '../../domain';
import { RegisterUserDto } from '../../domain/dtos/auth/register-user.dto';
import { EmailService } from './email.service';

export class AuthService {

    // DI
    constructor(

        // DI - Email service
        private readonly emailService: EmailService
    ) { }

    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email })

        if (existUser) throw CustomError.badRequest('Email. already exist')
        try {
            const user = new UserModel(registerUserDto)

            // todo: Encriptar la contraseña
            user.password = bcriptAdapter.hash(registerUserDto.password)
            await user.save()

            // todo: Generar un JWT para matener la autenticacion del usuario
            const token = await JwtAdapter.generateToken({ id: user.id })
            if (!token) throw CustomError.internalServer('Error while creating JWT')

            // todo: Mandar email de confirmacion
            this.sendEmialValidationLink(registerUserDto.email)

            const { password, ...userEntity } = UserEntity.fromObject(user)
            return {
                user: userEntity,
                token: token
            }
        } catch (error) {
            throw CustomError.internalServer(`${error}`)
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {

        const existUser = await UserModel.findOne({ email: loginUserDto.email })
        if (!existUser) throw CustomError.badRequest('Email does not exist')

        const isMatch = bcriptAdapter.compare(loginUserDto.password, existUser.password)
        if (!isMatch) throw CustomError.badRequest('Password is not valid')

        const { password, ...userEntity } = UserEntity.fromObject(existUser)

        const token = await JwtAdapter.generateToken({ id: existUser.id })
        if (!token) throw CustomError.internalServer('Error while creating JWT')

        return {
            user: userEntity,
            token: token
        }
    }

    private sendEmialValidationLink = async (email: string) => {
        const token = await JwtAdapter.generateToken({ email })
        if (!token) throw CustomError.internalServer('Error getting token')

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`
        const html = `
            <h1>Validate your email</h1>
            <p>Click on the link to validate your email</p>
            <a href="${link}">Validate you email</a>
        `

        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html,
        }

        const isSend = await this.emailService.sendEmail(options)
        if (!isSend) throw CustomError.internalServer('Error sending email')
        return true
    }

    public validateEmail = async (token: string) => {

        const payload = await JwtAdapter.validateToken(token)
        if (!payload) throw CustomError.unAuthorized('Invalid token')

        const { email } = payload as { email: string }
        if (!email) throw CustomError.internalServer('Email not in token')

        const user = await UserModel.findOne({ email })
        if (!user) throw CustomError.internalServer('Email not exist')

        user.emailValidated = true
        await user.save()

        return true
    }

}