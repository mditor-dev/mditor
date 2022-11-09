import { createPinia } from 'pinia';

const pinia = createPinia();
pinia.use(({ store }) => {
  store.$subscribe((mutation, state) => {
    // import { MutationType } from 'pinia'
    // mutation.type; // 'direct' | 'patch object' | 'patch function'
    // same as cartStore.$id
    // mutation.storeId; // 'cart'
    // only available with mutation.type === 'patch object'
    // mutation.payload; // patch object passed to cartStore.$patch()

    // persist the whole state to the local storage whenever it changes
    // localStorage.setItem('cart', JSON.stringify(state));
    // console.log('$subscribe', mutation.type, mutation.storeId, (mutation as any).payload, state);
    console.log(
      '%c storeId:%s, payload:%s',
      'color:#fff; background: linear-gradient(270deg, #986fee, #8695e6, #68b7dd, #18d7d3); padding: 8px 15px; border-radius: 0 15px 0 15px',
      mutation.storeId,
      (mutation as any).payload,
    );
    console.log('state:', { ...state });
  });

  // const unsubscribe = useTestStore().$onAction(
  store.$onAction(
    ({
      name, // name of the action
      // store, // store instance, same as `someStore`
      args, // array of parameters passed to the action
      after, // hook after the action returns or resolves
      onError, // hook if the action throws or rejects
    }) => {
      // a shared variable for this specific action call
      const startTime = Date.now();
      // this will trigger before an action on `store` is executed
      console.log(`Start "${name}" with params [${args.join(', ')}].`);

      // this will trigger if the action succeeds and after it has fully run.
      // it waits for any returned promised
      after((result) => {
        console.log(`Finished "${name}" after ${Date.now() - startTime}ms.\nResult: ${result}.`);
      });

      // this will trigger if the action throws or returns a promise that rejects
      onError((error) => {
        console.warn(`Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`);
      });
    },
  );

  // manually remove the listener
  // unsubscribe();
});

export default pinia;
