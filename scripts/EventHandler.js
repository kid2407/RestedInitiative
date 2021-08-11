export class EventHandler {
    static MODULE_ID = 'rested-initiative'

    static registerHooks() {
        Hooks.on('updateCombatant', async function (combatant) {
            await EventHandler._onUpdateCombatant(combatant)
        })
        Hooks.on('restCompleted', async function (actor) {
            await EventHandler._onRestFinished(actor)
        })
    }

    /**
     * @param {Combatant} combatant
     * @private
     */
    static async _onUpdateCombatant(combatant) {
        let savedInitiative = combatant.actor?.getFlag(this.MODULE_ID, 'initiative')
        if (savedInitiative !== null) {
            await combatant.update({initiative: savedInitiative})
            logger.info(`Updated initiative of combatant "${combatant.name}" (${combatant.id}) to ${savedInitiative}.`)
        }
    }

    /**
     * @param {Actor} actor
     * @private
     */
    static async _onRestFinished(actor) {
        await actor.setFlag(this.MODULE_ID, 'initiative', null)
        /** @var {Combat} combat */
        let combat = await actor.rollInitiative({createCombatants: true})
        // noinspection JSUnresolvedVariable
        let combatant = combat.combatants.filter(c => c.actor.id === actor.id)[0];
        logger.info(`Rolled new Initiative for ${actor.name} with result ${combatant.initiative}.`)
        await actor.setFlag(this.MODULE_ID, 'initiative', combatant.initiative)
        await combat.delete()
    }
}
