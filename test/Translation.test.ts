import { setTranslation } from '../src/translation/Translation'

describe('translate', () => {
    it('should translate', () => {
        const tr = setTranslation('de')
        expect(tr.tr('welcome')).toEqual('Willkommen')

        expect(tr.tr('in_x_meters', ['' + 27, 'sind Sie am Ziel'])).toEqual('In 27 Metern sind Sie am Ziel')
    })
})
