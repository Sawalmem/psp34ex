#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod psp34ex {
    use openbrush::contracts::psp34::*; 
    use openbrush::contracts::psp34::extensions::metadata::*;
    use openbrush::contracts::psp34::extensions::enumerable::*;  
    use ink_prelude::{
        string::String,
        vec::Vec,
    };
    use ink_storage::traits::SpreadAllocate;

    #[derive(Default, SpreadAllocate, PSP34Storage, PSP34MetadataStorage, PSP34EnumerableStorage)]
    #[ink(storage)]
    pub struct PSP34EX {
        #[PSP34StorageField]
        psp34: PSP34Data,
        #[PSP34MetadataStorageField]
        metadata: PSP34MetadataData,
        #[PSP34EnumerableStorageField]
        enumerable: PSP34EnumerableData,  
        id: u8,
        ipfshash: Vec<String>,
    }

    impl PSP34 for PSP34EX {}

    impl PSP34Metadata for PSP34EX {}

    impl PSP34Enumerable for PSP34EX {}

    impl PSP34EX {
        /// A constructor which mints the first token to the owner
        #[ink(constructor)]
        pub fn new(name: String, symbol: String) -> Self {
            ink_lang::codegen::initialize_contract(|instance: &mut Self| {
                let id = instance.collection_id();
                let name_key: Vec<u8> = String::from("name").into_bytes();
                let symbol_key: Vec<u8> = String::from("symbol").into_bytes();
                instance._set_attribute(id.clone(), name_key, name.into_bytes());
                instance._set_attribute(id, symbol_key, symbol.into_bytes());
            })
        }

        #[ink(message)]
        pub fn mint(&mut self, token_uri: String) -> Result<(), PSP34Error> {
            self._mint_to(Self::env().caller(), Id::U8(self.id))?;
            self.ipfshash.push(token_uri);
            self.id += 1;
            Ok(())
        }

        #[ink(message)]
        pub fn get_token_uri(&self, id: u8) -> String {
            self.ipfshash[id as usize].clone()
        }
    }
}